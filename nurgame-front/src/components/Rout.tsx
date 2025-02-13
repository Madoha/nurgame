import React from "react";
import {BrowserRouter, Routes, Route} from "react-router-dom";
import {Links} from "../models/Models.tsx";
import Login from "./login/Login.tsx";
import Register from "./register/Register.tsx";
import ForgotPassword from "./login/ForgotPassword.tsx";
import Layout from "./Layout.tsx";
import Profile from "./profile/Profile.tsx";
import Home from "./home/Home.tsx";
import Courses from "./courses/Courses.tsx";
import Lesson from "./courses/modules/lessons/Lesson.tsx";
import Test from "./courses/modules/lessons/Test.tsx";
import HomeNew from "./home/HomeNew.tsx";
import Contacts from "./staticPages/Contacts.tsx";
import AboutUs from "./staticPages/AboutUs.tsx";
import ModulesNew from "./courses/modules/ModulesNew.tsx";
import LessonPage from "./courses/modules/lessons/Lesson.tsx";
import LessonNew from "./courses/modules/lessons/LessonNew.tsx";
import TestNew from "./courses/modules/lessons/TestNew.tsx";
import ProfileNew from "./profile/ProfileNew.tsx";


const App: React.FC = () => {
    return (
        <div className="App">
            {/*<BrowserRouter>*/}
            {/*    <Routes>*/}
            {/*        /!* Маршруты без Header *!/*/}
            {/*        <Route path={Links.login} element={<Login/>}/>*/}
            {/*        <Route path={Links.register} element={<Register/>}/>*/}
            {/*        <Route path={Links.forgotPassword} element={<ForgotPassword/>}/>*/}

            {/*        /!* Маршруты с Header *!/*/}
            {/*        <Route element={<Layout/>}>*/}
            {/*            <Route path={Links.profile} element={<Profile/>}/>*/}
            {/*            <Route path={Links.home} element={<Home/>}/>*/}
            {/*            <Route path={Links.courses} element={<Courses/>}/>*/}
            {/*            <Route path={Links.lesson} element={<Lesson />} />*/}
            {/*            <Route path={Links.test} element={<Test/>}/>*/}
            {/*        </Route>*/}
            {/*    </Routes>*/}
            {/*</BrowserRouter>*/}
            <BrowserRouter>
                <Routes>
                    {/* Маршруты без Header */}
                    <Route path={Links.login} element={<Login/>}/>
                    <Route path={Links.register} element={<Register/>}/>
                    <Route path={Links.forgotPassword} element={<ForgotPassword/>}/>

                    {/* Маршруты с Header */}
                    <Route element={<Layout/>}>
                        <Route path={Links.home} element={<Home/>}/>
                        <Route path={Links.courses} element={<Courses/>}/>
                        <Route path={Links.lesson} element={<LessonNew />} />
                        <Route path={Links.test} element={<TestNew/>}/>
                        <Route path={Links.modules} element={<ModulesNew/>}/>
                        <Route path={Links.contacts} element={<Contacts/>}/>
                        <Route path={Links.about} element={<AboutUs/>}/>
                        <Route path={Links.profile} element={<ProfileNew/>}/>
                    </Route>
                </Routes>
            </BrowserRouter>
        </div>
    );
};

export default App;
