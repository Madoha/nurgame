module.exports = class UserDto {
    id;
    email;
    role;

    constructor(model){
        this.id = model.id;
        this.email = model.email;
        this.role = model.role;
    }
}