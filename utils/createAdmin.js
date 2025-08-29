const { log } = require("console");
const Admin = require("../models/Admin");
const { hashPass } = require("./password");

const createAdmin = async() => {
    const email = process.env.ADMINEMAIL;
    log("admin email:")
    log(email)
    if(!(await Admin.findOne({email}))){
        const hash = await hashPass(process.env.ADMINPASS)
        const admin = new Admin({
            name: 'admin', 
            role: 'admin',
            email,
            password: hash
        })

        await admin.save()
        console.log('created new admin')
        return
    }
    console.log('load previous admin')
}

module.exports = createAdmin;