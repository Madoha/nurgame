module.exports = class UserResponseDto {
    username;
    firstName;
    lastName;
    email;
    createdAt;
    updatedAt;
    role;
    avatarUrl;

    constructor({username, firstName, lastName, email, createdAt, updatedAt, role, avatarUrl}){
        this.username = username;
        this.firstName = firstName;
        this.lastName = lastName;
        this.email = email;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.role = role;
        this.avatarUrl = avatarUrl;
    }
}