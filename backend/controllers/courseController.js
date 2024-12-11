const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const courseModule = require('../db/models/coursemodule');
const course = require('../db/models/course');
const lesson = require('../db/models/lesson');
const test = require('../db/models/test');
const sequelize = require('../config/database');
const question = require('../db/models/question');
const answer = require('../db/models/answer');
const userCourseProgress = require('../db/models/usercourseprogress');
const certificate = require('../db/models/certificate');
const { sendAchievementNotification } = require('../utils/socket');
const AchievementService = require('../services/achievements/achievementService');
const ACHIEVEMENTS = require('../enum/achievements');
const CourseService = require('../services/courseService');
const PDFDocument = require('pdfkit');
const user = require('../db/models/user');
const fs = require('fs');
const path = require('path')

const create = catchAsync(async (req, res, next) => {
    const newCourse = course.create(req.body);
    return res.status(201).json(newCourse);
});

const getAllCourses = catchAsync(async (req, res, next) => {
    const courses = await course.findAll();
    res.json({
        success:true,
        data: courses
    })
})

// get all info(modules, lessons, courses) of the course \\ version 2
const getWith = catchAsync(async (req, res, next) => {
    const courseId = req.params.id;
    const result = await CourseService.getCourseWithInfo(courseId);

    return res.json(result);
});

// update course
const update = catchAsync(async (req, res, next) => {
    const courseId = req.params.id;
    const result = await CourseService.updateCourse(courseId, req.body);
    return res.json(result);
});

// delete course
const deleted = catchAsync(async (req, res, next) => {
    const courseId = req.params.id;
    await CourseService.deleteCourse(courseId);
    return res.json({message: 'course deleted'});
});

const addModules = catchAsync(async (req, res, next) => {
    const courseId = req.params.id;
    const courseModules = req.body;
    const result = await CourseService.addModules(courseId, courseModules)

    return res.status(201).json(result);
});

// start from here
const addLessons = catchAsync(async (req, res, next) => {
    const currentModule = await courseModule.findByPk(req.params.moduleId);
    if (!currentModule) throw new AppError('module not found');

    const lessons = await lesson.bulkCreate(req.body.map(lesson => ({
        ...lesson,
        courseModuleId: req.params.moduleId
    })));

    return res.status(201).json(lessons);
});

const addTests = catchAsync(async (req, res, next) => {
    const { courseId, moduleId } = req.params;

    const currentCourse = await course.findByPk(courseId);
    if (!currentCourse) throw new AppError('course not found');

    const currentModule = await courseModule.findOne({where: { id: moduleId, courseId}});
    if (!currentModule) {
        return next(new AppError('Module not found in the specified course', 404));
    }
    console.log('addTests body', req.body)
    
    const tests = await test.create({
        ...req.body,
        courseModuleId: moduleId
    });
    // const tests = await test.bulkCreate(req.body.map(test => ({
    //     ...test,
    //     courseModuleId: moduleId
    // })));

    return res.status(201).json(tests);
});

const addQuestionsAndAnswers = catchAsync(async (req, res, next) => {
    const { courseId, moduleId, testId } = req.params;
    const questions = req.body;
    console.log('questions', req.body);

    const currentCourse = await course.findByPk(courseId);
    if (!currentCourse) return next(new AppError('Coruse not found', 404));

    const currentModule = await courseModule.findOne({where: { id: moduleId, courseId }});
    if (!currentModule) return next(new AppError('Module not found in the specified course', 404));

    const currentTest = await test.findOne({where: { id: testId, courseModuleId: moduleId }})
    if (!currentTest) return next(new AppError('Test not found in the specified module', 404));

    const transaction = await sequelize.transaction();

    try {
        for(const questionData of questions) {
            const { text, answers } = questionData;

            const createdQuestion = await question.create(
                {
                    text,
                    testId: currentTest.id
                },
                { transaction }
            );

            const answerToCreate = answers.map((questionAnswers) => ({
                ...questionAnswers,
                questionId: createdQuestion.id
            }));

            await answer.bulkCreate(answerToCreate, { transaction })
        }

        await transaction.commit();

        res.status(201).json({ success: true, message: 'Questions and answers added successfully' });
    } catch (error) {
        await transaction.rollback();
        next(error);
    }
});

const getModuleTests = catchAsync(async (req, res, next) => {
    const { courseId, moduleId } = req.params;

    const currentCourse = await course.findByPk(courseId);
    if (!currentCourse) return next(new AppError('Coruse not found', 404));

    const currentModule = await courseModule.findOne({where: { id: moduleId, courseId }});
    if (!currentModule) return next(new AppError('Module not found in the specified course', 404));

    const currentTests = await test.findAll({
        where: { courseModuleId: moduleId }
    });

    if (!currentTests || currentTests.length === 0) {
        return res.status(200).json({
            success: true,
            message: 'No tests found for this module',
            tests: []
        });
    }

    const testsWithDetails = [];
    for (const currentTest of currentTests) {
        const testQuestions = await question.findAll({where: { testId: currentTest.id }});

        const questionWithAnswers = [];
        for (const testQuestion of testQuestions) {
            const questionAnswers = await answer.findAll({
                where: { questionId: testQuestion.id }
            });

            questionWithAnswers.push({
                id: testQuestion.id,
                text: testQuestion.text,
                answers: questionAnswers
            });
        }

        testsWithDetails.push({
            questions: questionWithAnswers
        });
    }

    res.json({
        tests: testsWithDetails[0].questions
    });
});

const getStarted = catchAsync(async (req, res, next) => {
    const courseId = req.params;
    const userId = req.user.id;

    const currentCourse = await course.findByPk(courseId);
    if (!currentCourse) return next(new AppError('Course not found', 404));

    const gettingAchivement = await AchievementService.unlockAchievement(userId, ACHIEVEMENTS.FIRST_FIGHT);
    if (gettingAchivement){
        sendAchievementNotification({
            id: gettingAchivement.id,
            name: gettingAchivement.name,
            description: gettingAchivement.description,
            reward: gettingAchivement.reward,
            icon: gettingAchivement.icon
        });
    }

    await userCourseProgress.create({
        userId,
        courseId
    });

    return res.status(200).json({ message: 'Course started successfully' });
});

const getModules = catchAsync(async (req, res, next) => {
    const courseId = req.params.id;

    const currentCourse = await course.findByPk(courseId);
    if (!currentCourse) return next(new AppError('Course not found', 404));

    const courseModules = await courseModule.findAll({where: { courseId }})

    return res.json(courseModules);
});

const getModuleLessons = catchAsync(async (req, res, next) => {
    const { courseId, moduleId } = req.params;

    const currentCourse = await course.findByPk(courseId);
    if (!currentCourse) return next(new AppError('Course not found', 404));

    const currentModule = await courseModule.findByPk(moduleId);
    if (!currentModule) return next(new AppError('Module not found', 404));

    const currentLessons = await lesson.findAll({where: { courseModuleId: moduleId }});

    return res.json(currentLessons)
});

// to test socket io
// const testACh = catchAsync(async (req, res, next) => {
//     console.log('sending')
//     sendAchievementNotification(1, {
//         id: 3,
//         name: 'first module'
//     });
// })

const getUserCourses = catchAsync(async (req, res, next) => {
    const userId = req.user.id;

    const allCourses = await userCourseProgress.findAll({where: { userId }});

    return res.json({
        success: true,
        data: allCourses
    });
});

const getQuestion = catchAsync(async (req, res, next) => {
    const { courseId, moduleId, questionId } = req.params;

    const currentCourse = await course.findByPk(courseId);
    if (!currentCourse) return next(new AppError('Coruse not found', 404));

    const currentModule = await courseModule.findOne({where: { id: moduleId, courseId }});
    if (!currentModule) return next(new AppError('Module not found in the specified course', 404));

    const currentTests = await test.findAll({
        where: { courseModuleId: moduleId }
    });

    if (!currentTests || currentTests.length === 0) {
        return res.status(200).json({
            success: true,
            message: 'No tests found for this module',
            tests: []
        });
    }
    const currentQuestion = await question.findByPk({where: {questionId}}) ;

    res.json({
        success: true,
        tests: currentQuestion
    });
});

// update for mcq open interactive and also if multiple tests ?? then handle it
const updateProgress = catchAsync(async (req, res, next) => {
    const { courseId, moduleId } = req.params;
    const userId = req.user.id;
    const { testScore } = req.body;
    
    // Преобразуем moduleId в integer (int)
    const moduleIdInt = parseInt(moduleId, 10);
    if (isNaN(moduleIdInt)) return next(new AppError('Invalid module ID', 400));

    console.log('bdbd', testScore);

    const currentCourse = await course.findByPk(courseId);
    if (!currentCourse) return next(new AppError('Course not found', 404));

    const currentModule = await courseModule.findOne({where: { id: moduleIdInt, courseId }});  // Поменяли на moduleIdInt
    if (!currentModule) return next(new AppError('Module not found in the specified course', 404));

    let progress = await userCourseProgress.findOne({where: { userId, courseId }});

    if (!progress) {
        progress = await userCourseProgress.create({
            userId,
            courseId
        })
    }

    if (progress.completedModules.includes(moduleIdInt)){
        return res.json({success: true, message: 'already completed'});
    }
    progress.score += testScore;  // Поменяли на testScoreFloat
    progress.completedModules = [...progress.completedModules, moduleIdInt];

    let coinsBonus = req.userStreak >= 5 ? 5 : 0;

    // if (testScoreFloat >= 80) { } 
    progress.coinsEarned += (1 + coinsBonus);

    if (progress.completedModules.length === progress.totalModules) {
        progress.coinsEarned += 5;
    }

    await progress.save();
    return res.json({success: true, message: 'progress updated'})
});


const getProgress= catchAsync(async (req, res, next) => {
    const { courseId } = req.params;
    const userId = 3;
    let progress = await userCourseProgress.findOne({where: { userId, courseId }});
    return res.json(progress)
});

const completeCourse = catchAsync(async (req, res, next) => {
    const { courseId } = req.params;
    const userId = req.user.id;

    const currentUser = await user.findOne({where: {id: userId}});

    const currentCourse = await course.findByPk(courseId);
    if (!currentCourse) return next(new AppError('Coruse not found', 404));

    const currentProgress = await userCourseProgress.findOne({where: { courseId, userId }});

    if (!currentProgress) return next(new AppError('please start the course and complete all modules', 400));

    if (currentProgress.completedModules.length !== 4) return next(new AppError('not allowed', 400));

    // todo coins course migrations
    const userScore = currentProgress.score;
    // const allScoreCount = await getMaxScoreForCourse(courseId);
    const allScoreCount = 44;
    const leastScore = allScoreCount * 0.8;
    const coinsEarned = currentProgress.coinsEarned;
    currentUser.coins += coinsEarned;
    await currentUser.save()
    // if (!(userScore >= leastScore)){
    //     throw new AppError('Ваша средняя оценка меньше 80 процентов, у вас нет прав закончить курс', 400); 
    // }

    const result = await certificate.create({
        score: userScore,
        userId: userId,
        courseId: courseId
    });

    const gettingAchivement = await AchievementService.unlockAchievement(userId, ACHIEVEMENTS.FIRST_FIGHT_COMPLETE);
    if (gettingAchivement){
        sendAchievementNotification({
            id: gettingAchivement.id,
            name: gettingAchivement.name,
            description: gettingAchivement.description,
            reward: gettingAchivement.reward,
            icon: gettingAchivement.icon
        });
    }

    await currentUser.save();

    const doc = new PDFDocument();

// Путь для папки с сертификатами
const certificatesDir = path.join(__dirname, '../../certificates');

// Проверка и создание папки, если она не существует
if (!fs.existsSync(certificatesDir)) {
    fs.mkdirSync(certificatesDir, { recursive: true });
}

// Путь для сохранения сертификата
const certificatePath = path.join(certificatesDir, `certificate_${currentUser.id}_${courseId}.pdf`);

// Поток для записи PDF
const writeStream = fs.createWriteStream(certificatePath);
writeStream.on('error', (err) => {
    console.error('Error writing the PDF:', err);
});

doc.pipe(writeStream);

// Функция для безопасного центрирования текста
function drawCenteredText(doc, text, fontSize, y) {
    const textWidth = doc.widthOfString(text);
    const pageWidth = doc.page.width;
    const x = (pageWidth - textWidth) / 2;  // Вычисление X для центрирования текста

    doc.fontSize(fontSize).text(text, x, y);
}

// Добавляем текст в сертификат
doc.fontSize(25);
drawCenteredText(doc, 'Certificate of completion of the course', 25, 100);
doc.moveDown();
drawCenteredText(doc, `Congratulations, ${currentUser.firstName} ${currentUser.lastName}!`, 20, 140);
doc.moveDown();
drawCenteredText(doc, `You have successfully completed the course: fight agains corruption`, 18, 180);
doc.moveDown();
drawCenteredText(doc, `Completion date: ${new Date().toLocaleDateString()}`, 12, 220);

// Завершаем создание документа
doc.end();

    return res.json({status: true, score: result.score, coins: coinsEarned})
});

const openQuestionAnswerCheck = catchAsync(async (req, res, next) => {
    const { courseId, moduleId, testId, questionId } = req.params;
    const userId = req.user.id;
    // todo gemini api open question
});

// private methods
const getMaxScoreForCourse = async (courseId) => {
    const query = `
        SELECT COUNT(q.id) AS totalQuestions
        FROM questions q
        JOIN tests t ON q.testId = t.id
        JOIN courseModules cm ON t.courseModuleId = cm.id
        WHERE cm.courseId = :courseId
    `;

    const result = await sequelize.query(query, {
        replacements: { courseId },
        type: sequelize.QueryTypes.SELECT,
      });

      return result[0].totalQuestions;
}

module.exports = { 
    create, 
    getWith,
    update, 
    deleted, 
    addModules, 
    addLessons, 
    addTests, 
    addQuestionsAndAnswers, 
    getModuleTests, 
    getAllCourses, 
    updateProgress, 
    completeCourse, 
    getStarted, 
    getModules,
    getModuleLessons,
    getQuestion,
    getUserCourses,
    openQuestionAnswerCheck,
    getQuestion,
    getProgress
};