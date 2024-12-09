module.exports = class UserRegistration {
    username;
    firstName;
    lastName;
    email;
    password;
    confirmPassword;
    roleName;

    constructor({username, firstName, lastName, email, password, confirmPassword, roleName}) {
        this.username = username;
        this.firstName = firstName;
        this.lastName = lastName;
        this.email = email;
        this.password = password;
        this.confirmPassword = confirmPassword;
        this.roleName = roleName;
    }
}