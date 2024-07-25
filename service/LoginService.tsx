import { Project } from "@/types";
import axios from "axios";
import { get } from "http";



export const axiosInstance = axios.create({
    baseURL: process.env.NEXT_PUBLIC_BACKEND_URL_API
})

export class LoginService{
    newRegister(user : Project.User){
        return axiosInstance.post("/auth/signup", user);
    }

    login(username : String, password : String){
        return axiosInstance.post("auth/login", {
            username : username, password : password
        });
    }
}