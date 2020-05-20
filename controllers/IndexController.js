const { User, School, Subject, Student, Teacher, Guardian, Class, Course, Student_Guardian, Class_Student, Lesson, Attendance, Evaluation, Student_Evaluation } = require("../models");
const bcrypt = require('bcrypt');
const saltRounds = 10;

module.exports = {
    renderLogin: (req, res) => {
        return res.render('index');
    },
    login: async (req, res) => {
        // READ INFOS FROM REQ.BODY
        let { userType, email, password } = req.body;
        // TRY AND LOAD A USER FROM DB WHOSE EMAIL == REQ.BODY.EMAIL
        const user = await User.findOne(
            {
                where: { email }
            }
        );
        // IF THAT USER DOES NOT EXIST IN DB, REDIRECT TO LOGIN
        if (!user) {
            return res.redirect("/login?error=1");
        }
        // IF USER EXISTS, COMPARE REQ.BODY.PASSWORD WITH DB PASSWORD
        // AND IF THEY DON'T MATCH, REDIRECT TO LOGIN ALSO
        if (!bcrypt.compareSync(password, user.password)) {
            return res.redirect("/login?error=1");
        }
        // IF PASSWORDS MATCH, SET A SESSION FOR THE USER
        req.session.user = user;
        // FINALLY, MANAGE REDIRECTIONS
        const isTeacher = await Teacher.findOne({ where: { userId: user.id } });
        const isGuardian = await Guardian.findOne({ where: { userId: user.id } });

        if (isTeacher && isGuardian) {
            return res.redirect(`/${userType}/home`);
        } else if (isTeacher) {
            return res.redirect(`/professor/home`);
        } else {
            return res.redirect(`/responsavel/home`);
        }
    },
    renderTeacherHome: async (req, res) => {
        // GET TEACHER DATA FROM DB,
        // AND THEN...
        return res.render("teacher-home");
    },
    renderGuardianHome: async (req, res) => {
        // GET GUARDIAN DATA FROM DB,
        // AND THEN...
        return res.render("guardian-home");
    },
    redirectToRegistrationForm: (req, res) => {
        return req.query.usuario == "professor" ?
            res.redirect("/professor/cadastrar") :
            res.redirect("/responsavel/cadastrar");
    },
    renderTeacherRegistrationForm: (req, res) => {
        res.render("register-teacher");
    },
    renderGuardianRegistrationForm: (req, res) => {
        res.render("register-guardian");
    },
    registerTeacher: async (req, res, next) => {
        // CREATE USER - OK
        const { forename, surname, email, phone, password } = req.body;
        let picture;
        req.file ? picture = req.file.filename : picture = null;

        const user = await User.create(
            {
                forename,
                surname,
                email,
                phone,
                password: bcrypt.hashSync(password, saltRounds),
                picture
            }
        );

        // ASSOCIATE USER TO A CATEGORY - OK
        const category = await Category.findByPk(1); // CATEGORY PROFESSOR
        await user.setCategories(category);

        // CREATE SCHOOLS - OK
        const objKeysSchool = Object.keys(req.body).filter(
            key => key.substr(0, 6) == "school"
        );
        let schoolsList = [];
        for (school of objKeysSchool) {
            schoolsList.push(
                {
                    name: req.body[school][2],
                    passing_grade: req.body[school][3],
                    academic_terms: req.body[school][4],
                    state: req.body[school][0],
                    municipality: req.body[school][1]
                }
            );
        };
        const schools = await School.bulkCreate(schoolsList);

        // CREATE CLASSES - OK
        const objKeysClass = Object.keys(req.body).filter( // ex. return [ "class1-school1", "class2-school1", "class1-school2" ]
            key => key.substr(0, 5) == "class"
        );
        let classesList = [];
        for (let i = 1; i <= schools.length; i++) {
            let thisSchoolClasses = objKeysClass.filter(
                thisClass => thisClass.includes(`school${i}`)
            );
            for (aClass of thisSchoolClasses) {
                let grade = req.body[aClass][2].split("-"); // ex. return [ "Ensino Fundamental", "6" ]
                classesList.push(
                    {
                        code: req.body[aClass][0],
                        year: req.body[aClass][1],
                        level_of_education: grade[0],
                        grade: grade[1],
                        schools_id: schools[i - 1].id // ASSOCIATE CLASSES TO A SCHOOL
                    }
                );
            };
        };
        const classes = await Class.bulkCreate(classesList);



        // ASSOCIATE USER TO CLASSES (THROUGH USER_CATEGORY)
        const userCategory = await User_Category.findOne({
            where: { users_id: user.id }
        });
        await userCategory.setClasses(classes);

        // USERS_CLASSES TABLE
        let userClasses = await User_Class.findAll();

        return res.send(userClasses);
        // return res.redirect("/professor/cadastrar");




        // CREATE STUDENTS
        let objKeysStudent = Object.keys(req.body).filter(
            key => key.substr(0, 7) == "student"
        );
        let studentsList = [];
        for (student of students) {
            studentsList.push(
                {
                    name: req.body[student][1]
                }
            );
            // let student_number = req.body[student][0];
            // let repeater = req.body[student].length > 2;
        };
        // students = await Student.bulkCreate(studentsList);

        // CREATE SUBJECTS
        const objKeysSubjects = Object.keys(req.body).filter( // ex. return [ "subjects-class1-school1", "subjects-class2-school1", "subjects-class1-school2" ]
            key => key.substr(0, 8) == "subjects"
        );
        let subjectsList = []; // may have repeated strings
        for (subject of objKeysSubjects) {
            subjectsList.push(
                req.body[subject]
            );
        };





        // SET A SESSION FOR THE USER
        // let user = await User.findOne({ where: { email } })
        // req.session.user = user;
        // AND THEN...
        // return res.redirect("/professor/home");
    },
    registerGuardian: async (req, res, next) => {
        // ENCRYPT PASSWORD,
        // SAVE DATA IN DB,
        // SET A SESSION,
        // AND THEN...
        return res.redirect("/responsavel/home");
    },
    renderTeacherUpdateForm: async (req, res) => {
        // LOAD USER FROM DB
        // PASS OBJECT USER INTO RENDER METHOD
        return res.render("update-teacher");
    },
    renderGuardianUpdateForm: async (req, res) => {

    },
    updateTeacher: async (req, res, next) => {
        // GET REQ.BODY CONTENT
        // AND UPDATE DATA IN DB
        // const result = await User.update({
        //     // DATA TO UPDATE
        // },
        // {
        //     where: {
        //         id
        //     }
        // });
    },
    updateGuardian: async (req, res, next) => {

    },
    deleteTeacher: async (req, res) => {
        // RETRIEVE USER ID,
        // AND DELETE ONLY TEACHER USER TYPE
        // OR DELETE USER FROM DB
        // const result = await User.destroy(
        //     {
        //         where: {

        //         }
        //     }
        // );
    },
    deleteGuardian: async (req, res) => {
        // RETRIEVE USER ID,
        // AND DELETE ONLY GUARDIAN USER TYPE
        // OR DELETE USER FROM DB
        // const result = await User.destroy(
        //     {
        //         where: {

        //         }
        //     }
        // );
    },
    renderGradeBook: (req, res) => {
        return res.render("set-notes");
    },
    recordGrades: (req, res) => {

    },
    renderAttendanceSheet: (req, res) => {
        return res.render("attendance");
    },
    recordAttendances: (req, res) => {

    },
    renderRecordBook: (req, res) => {
        return res.render('daily');
    }
};