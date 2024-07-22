declare namespace Projeto{
    type User = {
        id: number;
        name: string;
        login: string;
        password: string;
        email: string;
    }

    type Resource = {
        id: number;
        name: string;
        key: string;
    }

    type Profile = {
        id: number;
        description: string;
    }

}