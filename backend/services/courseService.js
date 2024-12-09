const course = require("../db/models/course");
const courseModule = require('../db/models/coursemodule');
const AppError = require('../utils/appError');
const lesson = require('../db/models/lesson')

class CourseService{
    // for open question if need
    static async openQuestionGemini(){
        
    }

    static async getCourseWithInfo(courseId){
        const currentCourse = await course.findByPk(courseId);
        if (!currentCourse) {
            throw new AppError('Course not found', 404);
        }

        const courseModules = await courseModule.findAll({where: {courseId: courseId}});
    
        const modulesWithLessons = await Promise.all(
            courseModules.map(async (curModule) => {
                const moduleLessons = await lesson.findAll({where: { courseModuleId: curModule.id }});
                return { ...curModule.dataValues, lessons: moduleLessons.map((lesson) => lesson.dataValues) }
            })
        );

        const response = {
            ...currentCourse.dataValues,
            modules: modulesWithLessons
        };

        return response;
    }

    static async updateCourse(courseId, courseBody){
        const [updated] = await course.update(courseBody, { where: { id: courseId } });
        if (!updated) throw new AppError('course not found', 404);
        const updatedCourse = await course.findByPk(courseId);
        return updatedCourse;
    }

    static async deleteCourse(courseId){
        const deletedCourse = await course.destroy({where: { id: courseId }});
        if (!deletedCourse) throw new AppError('course not found', 404);    
        return true;
    }

    static async addModules(courseId, courseModules){
        const currentCourse = await course.findByPk(courseId);
        if (!currentCourse) throw new AppError('course not found');

        const modules = await courseModule.bulkCreate(courseModules.map(module => ({
            ...module,
            courseId: courseId
        })));

        return modules;
    }

    
}

module.exports = CourseService;