const inquirer = require('inquirer');
const db = require('./config/connection');

async function userDatabaseSearch() {
    const { option } = await inquirer.prompt([
        {
            type: 'list',
            name: 'option',
            message: 'What would you like to do?',
            choices: [
                'View All Employees', 
                'Update Employee Role', 
                'View All Roles', 'Add Role', 
                'View All Departments', 
                'Add Department', 
                'Exit'
            ]
        }
    ]);

    switch (option) {
        case 'View All Employees':
            await viewAllEmployees();
            break;
        case 'Update Employee Role':
            await updateEmployeeRole();
            break;
        case 'View All Roles':
            await viewAllRoles();
            break;
        case 'Add Role':
            await addRole();
            break;
        case 'View All Departments':
            await viewAllDepartments();
            break;
        case 'Add Department':
            await addDepartment();
            break;
        case 'Exit':
            db.end();
            process.exit();
    }
}

async function viewAllEmployees() {
    try {
        const [results] = await db.query('SELECT * FROM employee');
        console.table(results);
    } catch (err) {
        console.error('Error fetching employees:', err.stack);
    } finally {
        userDatabaseSearch();
    }
}

async function updateEmployeeRole() {
    try {
        const [employees] = await db.query('SELECT * FROM employee');
        const [roles] = await db.query('SELECT * FROM role');

        const employeeChoices = employees.map(employee => ({
            name: `${employee.first_name} ${employee.last_name}`,
            value: employee.id
        }));

        const roleChoices = roles.map(role => ({
            name: role.title,
            value: role.id
        }));

        const { employeeId, roleId } = await inquirer.prompt([
            {
                type: 'list',
                name: 'employeeId',
                message: 'Select an employee to update:',
                choices: employeeChoices
            },
            {
                type: 'list',
                name: 'roleId',
                message: 'Select the new role:',
                choices: roleChoices
            }
        ]);

        await db.query('UPDATE employee SET role_id = ? WHERE id = ?', [roleId, employeeId]);
        console.log('Employee role updated successfully.');
    } catch (err) {
        console.error('Error updating employee role:', err.stack);
    } finally {
        userDatabaseSearch();
    }
}

async function viewAllRoles() {
    try {
        const [results] = await db.query('SELECT * FROM role');
        console.table(results);
    } catch (err) {
        console.error('Error fetching roles:', err.stack);
    } finally {
        userDatabaseSearch();
    }
}

async function addRole() {
    try {
        const [departments] = await db.query('SELECT * FROM department');

        if (departments.length === 0) {
            console.log('No departments found. Please add a department first.');
            return userDatabaseSearch();
        }

        const departmentChoices = departments.map(dept => ({
            name: `${dept.name}(${dept.id})`,
            value: dept.id
        }));

        const { title, salary, departmentId } = await inquirer.prompt([
            {
                type: 'input',
                name: 'title',
                message: 'Enter the title of the new role:'
            },
            {
                type: 'input',
                name: 'salary',
                message: 'Enter the salary for the new role:'
            },
            {
                type: 'list',
                name: 'departmentId',
                message: 'Enter the department ID for the new role:',
                choices: departmentChoices
            }
        ]);

        await db.query('INSERT INTO role (title, salary, department_id) VALUES (?, ?, ?)', [title, salary, departmentId]);
        console.log('Role added successfully.');
    } catch (err) {
        console.error('Error adding role:', err.stack);
    } finally {
        userDatabaseSearch();
    }
}

async function viewAllDepartments() {
    try {
        const [results] = await db.query('SELECT * FROM department');
        console.table(results);
    } catch (err) {
        console.error('Error fetching departments:', err.stack);
    } finally {
        userDatabaseSearch();
    }
}

async function addDepartment() {
    try {
        const { name } = await inquirer.prompt([
            {
                type: 'input',
                name: 'name',
                message: 'Enter the name of the new department:'
            }
        ]);

        await db.query('INSERT INTO department (name) VALUES (?)', [name]);
        console.log('Department added successfully.');
    } catch (err) {
        console.error('Error adding department:', err.stack);
    } finally {
        userDatabaseSearch();
    }
}

// Initialize the application
userDatabaseSearch();