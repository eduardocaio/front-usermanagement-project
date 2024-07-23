import { BaseService } from "./BaseService";

export class PermissionService extends BaseService{

    constructor(){
        super("/permissions");
    }
  
}