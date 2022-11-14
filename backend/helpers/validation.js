const User = require("../models/User");

exports.validateEmail=(email)=>{
    /**
     * Any email must have three parts ,can also have fourth as optional
     *  1(username)  @  2(domain)  .  3(extension)  .  4(optional extensoin)
     *   manish     @   gmail       .   com         .       in
     * eg: manish@gmail.com.in
     * 1) any letters,numbers,dots and/or hyphens
     * 2) any letters, numbers and/or hyphens
     * 3) any letters
     * 4) a dot (.) then any character
     * 
     * Let's build the regex 
     * any regex starts with .match(/^$/)
     * Since our email has four parts ,each part is seperated through ()
     * so now our regex looks like this  .match(/^()()()()$/)
     */
    return String(email).toLowerCase().match(/^([a-z\d\.-]+)@([a-z\d-]+)\.([a-z]{2,12})(\.[a-z]{2,12})?$/)
}

exports.validateLength=(text,min,max)=>{
    if(text.length >max || text.length< min){
        return false;
    }
    return true;
}

exports.validateUsername=async(username)=>{
    let itr=false;
    do{ 
        let check=await User.findOne({username});
        if(check){
            // change username
            username += (+new Date()*Math.random()).toString().substring(0,1);
            itr=true;
        }else{
            itr=false;
        }
    }while(itr)
    return username
}