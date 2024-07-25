/* eslint-disable @next/next/no-img-element */
'use client';
import { useRouter } from 'next/navigation';
import React, { useContext, useMemo, useRef, useState } from 'react';
import { Checkbox } from 'primereact/checkbox';
import { Button } from 'primereact/button';
import { Password } from 'primereact/password';
import { LayoutContext } from '../../../../layout/context/layoutcontext';
import { InputText } from 'primereact/inputtext';
import { classNames } from 'primereact/utils';
import { Project } from '@/types';
import { LoginService } from '@/service/LoginService';
import { Toast } from 'primereact/toast';

const NewUserPage = () => {

    let userNull: Project.User = {
        id: 0,
        name: '',
        username: '',
        password: '',
        email: ''
    };

    const[user, setUser] = useState<Project.User>(userNull);
    const { layoutConfig } = useContext(LayoutContext);
    const loginService = useMemo(() => new LoginService(), []);
    const toast = useRef<Toast>(null);


    const router = useRouter();
    const containerClassName = classNames('surface-ground flex align-items-center justify-content-center min-h-screen min-w-screen overflow-hidden', { 'p-input-filled': layoutConfig.inputStyle === 'filled' });

    const onInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>, name: string) => {
        const val = (e.target && e.target.value) || '';
        let _user = { ...user };
        _user[`${name}`] = val;
        setUser(_user);
    };

    const newUser = () => {
        loginService.newRegister(user).then((response) => {
                setUser(userNull);
                toast.current?.show({
                    severity: 'info',
                    summary: 'Sucesso!',
                    detail: 'Usuário cadastrado com sucesso!'
        })}).catch((error) => {
            console.log(error.data.message);
            toast.current?.show({
                severity: 'error',
                summary: 'Erro!!',
                detail: 'Erro ao cadastrar!'
            })

        });
    }

    return (
        <div className={containerClassName}>
            <Toast ref={toast} />
            <div className="flex flex-column align-items-center justify-content-center">
                <img src={`/layout/images/logo-${layoutConfig.colorScheme === 'light' ? 'dark' : 'white'}.svg`} alt="Sakai logo" className="mb-5 w-6rem flex-shrink-0" />
                <div
                    style={{
                        borderRadius: '56px',
                        padding: '0.3rem',
                        background: 'linear-gradient(180deg, var(--primary-color) 10%, rgba(33, 150, 243, 0) 30%)'
                    }}
                >
                    <div className="w-full surface-card py-8 px-5 sm:px-8" style={{ borderRadius: '53px' }}>
                        <div className="text-center mb-5">
                            <div className="text-900 text-3xl font-medium mb-3">Sou novo por aqui!</div>
                        </div>

                        <div>
                            <label htmlFor="name" className="block text-900 text-xl font-medium mb-2">
                                Nome
                            </label>
                            <InputText id="name" type="text" placeholder="Nome" className="w-full md:w-30rem mb-5" style={{ padding: '1rem' }} value={user.name}
                                onChange={(e) => onInputChange(e, 'name')} />

                            <label htmlFor="username" className="block text-900 text-xl font-medium mb-2">
                                Nome de usuário
                            </label>
                            <InputText id="username" type="text" placeholder="Digite o nome de usuário desejado" className="w-full md:w-30rem mb-5" style={{ padding: '1rem' }} value={user.login}
                                onChange={(e) => onInputChange(e, 'login')}/>

                            <label htmlFor="password" className="block text-900 font-medium text-xl mb-2">
                                Senha
                            </label>
                            <Password inputId="password" placeholder="Digite sua senha" toggleMask className="w-full mb-5" inputClassName="w-full p-3 md:w-30rem" value={user.password} onChange={(e) => onInputChange(e, 'password')}></Password>

                            <label htmlFor="email" className="block text-900 text-xl font-medium mb-2">
                                E-mail
                            </label>
                            <InputText id="email" type="text" placeholder="Digite seu e-mail" className="w-full md:w-30rem mb-5" style={{ padding: '1rem' }} value={user.email}
                                onChange={(e) => onInputChange(e, 'email')}/>

                            <div className="flex align-items-center justify-content-between mb-5 gap-5">
                                <a className="font-medium no-underline ml-2 text-right cursor-pointer" style={{ color: 'var(--primary-color)' }} onClick={() => router.push('/auth/login')}>
                                    Já tenho cadastro!
                                </a>
                            </div>
                            <Button label="Efetuar cadastro" className="w-full p-3 text-xl" onClick={() => newUser()}></Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default NewUserPage;
