import { Project } from "@/types";
import axios from "axios";
import { get } from "http";



export const axiosInstance = axios.create({
    baseURL: "http://localhost:8080"
})

export class UserService{

    findAll(){
        return axiosInstance.get("/users")
    }

    create(user : Project.User){
        return axiosInstance.post("/users", user)
    }

    update(user : Project.User){
        return axiosInstance.put("/users", user)
    }

    delete(id : number){
        return axiosInstance.delete("/users/" + id)
    }
}