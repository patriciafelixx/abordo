module.exports = (sequelize, DataTypes) => {
    let Class = sequelize.define(
        "class",
        {
            code: {
                type: DataTypes.STRING(10),
                allowNull: false
            },
            level_of_education: {
                type: DataTypes.STRING(25),
                allowNull: false
            },
            grade: {
                type: DataTypes.INTEGER(2),
                allowNull: false
            },
            year: {
                type: DataTypes.STRING(4),
                allowNull: false
            },
            number_of_students: {
                type: DataTypes.INTEGER.UNSIGNED,
                allowNull: false
            },
            number_of_subjects: {
                type: DataTypes.INTEGER.UNSIGNED,
                allowNull: false
            },
            number_of_teachers: {
                type: DataTypes.INTEGER.UNSIGNED,
                allowNull: false
            },
            schools_id: {
                type: DataTypes.INTEGER.UNSIGNED,
                allowNull: false,
                // references: {
                //     model: "schools",
                //     key: "id",
                // },
                onUpdate: "CASCADE",
                onDelete: "CASCADE"
            }
        },
        {
            tableName: "classes",
            timestamps: false
        }
    );

    Class.associate = (models) => {
        Class.belongsTo(models.schools, {
            foreignKey: "schools_id",
            as: "schools"
        });
        Class.belongsToMany(models.users, {
            foreignKey: "users_id",
            as: "users",
            through: models.users_classes
        });
        Class.hasMany(models.users_classes, {
            as: "student_numbers"
        });
        Class.belongsToMany(models.subjects, {
            foreignKey: "subjects_id",
            as: "subjects",
            through: models.lessons
        });
        Class.hasMany(models.lessons, {
            as: "lessons"
        });
    };

    return Class;
};