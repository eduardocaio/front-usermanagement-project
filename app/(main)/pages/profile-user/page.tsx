/* eslint-disable @next/next/no-img-element */
'use client';
import { Button } from 'primereact/button';
import { Column } from 'primereact/column';
import { DataTable } from 'primereact/datatable';
import { Dialog } from 'primereact/dialog';
import { FileUpload } from 'primereact/fileupload';
import { InputText } from 'primereact/inputtext';
import { Toast } from 'primereact/toast';
import { Toolbar } from 'primereact/toolbar';
import { classNames } from 'primereact/utils';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Project } from '@/types';
import { ProfileUserService } from '@/service/ProfileUserService';
import { UserService } from '@/service/UserService';
import { ProfileService } from '@/service/ProfileService';
import { Dropdown, DropdownChangeEvent } from 'primereact/dropdown';

/* @todo Used 'as any' for types here. Will fix in next version due to onSelectionChange event type issue. */
const ProfileUser = () => {
    let profileUserNull: Project.ProfileUser = {
        id: 0,
        profile: {description: ''},
        user: {name: '', login: '', password: '', email: ''}
    };

    const [profilesUsers, setProfilesUsers] = useState<Project.ProfileUser[] | null>(null);
    const [profileUserDialog, setProfileUserDialog] = useState(false);
    const [deleteProfileUserDialog, setDeleteProfileUserDialog] = useState(false);
    const [deleteProfilesUsersDialog, setDeleteProfilesUsersDialog] = useState(false);
    const [profileUser, setProfileUser] = useState<Project.ProfileUser>(profileUserNull);
    const [selectedProfilesUsers, setSelectedProfilesUsers] = useState<Project.ProfileUser[]>([]);
    const [submitted, setSubmitted] = useState(false);
    const [globalFilter, setGlobalFilter] = useState('');
    const toast = useRef<Toast>(null);
    const dt = useRef<DataTable<any>>(null);
    const profileUserService = useMemo(() => new ProfileUserService(), []);
    const userService = useMemo(() => new UserService, [])
    const profileService = useMemo(() => new ProfileService, [])
    const [users, setUsers] = useState<Project.User[]>([])
    const [profiles, setProfiles] = useState<Project.Profile[]>([])

    useEffect(() => {
        if (!profilesUsers) {
            profileUserService.findAll().then((response) => {
                console.log(response.data);
                setProfilesUsers(response.data);
            }).catch((error) => {
                console.log(error);
            });
        }
    }, [profileUserService, profilesUsers]);

    useEffect(() => {
        if(profileUserDialog){
            userService.findAll().then((response) => setUsers(response.data)).catch(error => {
                console.log(error);
                toast.current?.show({
                    severity: 'error',
                    summary: 'Erro!',
                    detail: 'Erro ao carregar a lista de usuários!'
                });
            });
            profileService.findAll().then((response) => setProfiles(response.data)).catch(error => {
                console.log(error);
                toast.current?.show({
                    severity: 'error',
                    summary: 'Erro!',
                    detail: 'Erro ao carregar a lista de perfis!'
                });
            });
        }
    }, [profileUserDialog, profileService, userService]);


    const openNew = () => {
        setProfileUser(profileUserNull);
        setSubmitted(false);
        setProfileUserDialog(true);
    };

    const hideDialog = () => {
        setSubmitted(false);
        setProfileUserDialog(false);
    };

    const hideDeleteProfileUserDialog = () => {
        setDeleteProfileUserDialog(false);
    };

    const hideDeleteProfilesUsersDialog = () => {
        setDeleteProfilesUsersDialog(false);
    };

    const saveProfileUser = () => {
        setSubmitted(true);

        if (!profileUser.id) {
            profileUserService.create(profileUser).then((response) => {
                setProfileUserDialog(false);
                setProfileUser(profileUserNull);
                setProfilesUsers(null);
                toast.current?.show({
                    severity: 'info',
                    summary: 'Sucesso!',
                    detail: 'Perfil-usuário cadastrado com sucesso!'
                })
            }).catch((error) => {
                console.log(error.data.message);
                toast.current?.show({
                    severity: 'error',
                    summary: 'Erro!',
                    detail: 'Erro ao salvar!'
                })
            })
        }
        else {
            profileUserService.update(profileUser).then((response) => {
                setProfileUserDialog(false);
                setProfileUser(profileUserNull);
                setProfilesUsers(null);
                toast.current?.show({
                    severity: 'info',
                    summary: 'Sucesso!',
                    detail: 'Perfil-usuário alterado com sucesso!'
                })
            }).catch((error) => {
                console.log(error.data.message);
                toast.current?.show({
                    severity: 'error',
                    summary: 'Erro!',
                    detail: 'Erro ao salvar!'
                })
            })
        }

    };

    const editProfileUser = (profileUser: Project.ProfileUser) => {
        setProfileUser({ ...profileUser });
        setProfileUserDialog(true);
    };

    const confirmDeleteProfileUser = (profileUser: Project.ProfileUser) => {
        setProfileUser(profileUser);
        setDeleteProfileUserDialog(true);
    };

    const deleteProfileUser = () => {
        if (profileUser.id) {
            profileUserService.delete(profileUser.id).then((response) => {
                setProfileUser(profileUserNull);
                setDeleteProfileUserDialog(false);
                setProfilesUsers(null);
                toast.current?.show({
                    severity: "success",
                    summary: "Sucesso!",
                    detail: "Perfil-usuário deletado com sucesso!",
                    life: 3000
                })
            }).catch((error) => {
                toast.current?.show({
                    severity: "error",
                    summary: "Erro!",
                    detail: "Erro ao deletar perfil-usuário!",
                    life: 3000
                })
            })

        }
    };

    const exportCSV = () => {
        dt.current?.exportCSV();
    };

    const confirmDeleteSelected = () => {
        setDeleteProfilesUsersDialog(true);
    };

    const deleteSelectedProfilesUsers = () => {

        Promise.all(selectedProfilesUsers.map(async (_profileUser) => {
            if (_profileUser.id) {
                await profileUserService.delete(_profileUser.id);
            }
        })).then((response) => {
            setProfilesUsers(null);
            setSelectedProfilesUsers([]);
            setDeleteProfilesUsersDialog(false);
            toast.current?.show({
                severity: 'success',
                summary: 'Sucesso!',
                detail: 'Perfis-usuários deletados com Sucesso!',
                life: 3000
            });
        }).catch((error) => {
            toast.current?.show({
                severity: 'error',
                summary: 'Erro!',
                detail: 'Erro ao deletar perfis-usuários!',
                life: 3000
            })
        });
    };


    const onInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>, name: string) => {
        const val = (e.target && e.target.value) || '';
        //let _resource = { ...resource };
        //_user[`${name}`] = val;

        setProfileUser(prevProfileUser => ({
            ...prevProfileUser,
            [name]: val,
        }));
    };


    const leftToolbarTemplate = () => {
        return (
            <React.Fragment>
                <div className="my-2">
                    <Button label="Novo" icon="pi pi-plus" severity="success" className=" mr-2" onClick={openNew} />
                    <Button label="Excluir" icon="pi pi-trash" severity="danger" onClick={confirmDeleteSelected} disabled={!selectedProfilesUsers || !(selectedProfilesUsers as any).length} />
                </div>
            </React.Fragment>
        );
    };

    const rightToolbarTemplate = () => {
        return (
            <React.Fragment>
                <FileUpload mode="basic" accept="image/*" maxFileSize={1000000} chooseLabel="Import" className="mr-2 inline-block" />
                <Button label="Export" icon="pi pi-upload" severity="help" onClick={exportCSV} />
            </React.Fragment>
        );
    };

    const idBodyTemplate = (rowData: Project.Profile) => {
        return (
            <>
                <span className="p-column-title">Id</span>
                {rowData.id}
            </>
        );
    };

    const profileBodyTemplate = (rowData: Project.ProfileUser) => {
        return (
            <>
                <span className="p-column-title">Perfil</span>
                {rowData.profile.description}
            </>
        );
    };

    const userBodyTemplate = (rowData: Project.ProfileUser) => {
        return (
            <>
                <span className="p-column-title">Usuário</span>
                {rowData.user.name}
            </>
        );
    };

    const actionBodyTemplate = (rowData: Project.ProfileUser) => {
        return (
            <>
                <Button icon="pi pi-pencil" rounded severity="success" className="mr-2" onClick={() => editProfileUser(rowData)} />
                <Button icon="pi pi-trash" rounded severity="warning" onClick={() => confirmDeleteProfileUser(rowData)} />
            </>
        );
    };

    const header = (
        <div className="flex flex-column md:flex-row md:justify-content-between md:align-items-center">
            <h5 className="m-0">Gerenciamento de Perfis-Usuários</h5>
            <span className="block mt-2 md:mt-0 p-input-icon-left">
                <i className="pi pi-search" />
                <InputText type="search" onInput={(e) => setGlobalFilter(e.currentTarget.value)} placeholder="Search..." />
            </span>
        </div>
    );

    const profileUserDialogFooter = (
        <>
            <Button label="Cancelar" icon="pi pi-times" text onClick={hideDialog} />
            <Button label="Salvar" icon="pi pi-check" text onClick={saveProfileUser} />
        </>
    );
    const deleteProfileUserDialogFooter = (
        <>
            <Button label="Não" icon="pi pi-times" text onClick={hideDeleteProfileUserDialog} />
            <Button label="Sim" icon="pi pi-check" text onClick={deleteProfileUser} />
        </>
    );
    const deleteProfilesUsersDialogFooter = (
        <>
            <Button label="Não" icon="pi pi-times" text onClick={hideDeleteProfilesUsersDialog} />
            <Button label="Sim" icon="pi pi-check" text onClick={deleteSelectedProfilesUsers} />
        </>
    );

    const onSelectProfileChange = (profile: Project.Profile) => {
        let _profileUser = { ...profileUser};
        _profileUser.profile = profile;
        setProfileUser(_profileUser);
    }

    const onSelectUserChange = (user: Project.User) => {
        let _profileUser = { ...profileUser};
        _profileUser.user = user;
        setProfileUser(_profileUser);
    }

    return (
        <div className="grid crud-demo">
            <div className="col-12">
                <div className="card">
                    <Toast ref={toast} />
                    <Toolbar className="mb-4" left={leftToolbarTemplate} right={rightToolbarTemplate}></Toolbar>

                    <DataTable
                        ref={dt}
                        value={profilesUsers}
                        selection={selectedProfilesUsers}
                        onSelectionChange={(e) => setSelectedProfilesUsers(e.value as any)}
                        dataKey="id"
                        paginator
                        rows={10}
                        rowsPerPageOptions={[5, 10, 25]}
                        className="datatable-responsive"
                        paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                        currentPageReportTemplate="Mostrando {first} até {last} de {totalRecords} perfis-usuários"
                        globalFilter={globalFilter}
                        emptyMessage="Nenhum perfil-usuário encontrado."
                        header={header}
                        responsiveLayout="scroll"
                    >
                        <Column selectionMode="multiple" headerStyle={{ width: '4rem' }}></Column>
                        <Column field="id" header="ID" sortable body={idBodyTemplate} headerStyle={{ minWidth: '15rem' }}></Column>
                        <Column field="profile" header="Perfil" sortable body={profileBodyTemplate} headerStyle={{ minWidth: '15rem' }}></Column>
                        <Column field="user" header="Usuário" sortable body={userBodyTemplate} headerStyle={{ minWidth: '15rem' }}></Column>
                        <Column body={actionBodyTemplate} headerStyle={{ minWidth: '10rem' }}></Column>
                    </DataTable>

                    <Dialog visible={profileUserDialog} style={{ width: '450px' }} header="Detalhes de perfil-usuário" modal className="p-fluid" footer={profileUserDialogFooter} onHide={hideDialog}>
                        <div className="field">
                            <label htmlFor="profile">Perfil</label>
                            <Dropdown optionLabel="description" value={profileUser.profile} options={profiles} filter onChange={(e: DropdownChangeEvent) => onSelectProfileChange(e.value)} placeholder='Selecione um perfil...'/>
                            {submitted && !profileUser.profile && <small className="p-invalid">Perfil é obrigatório.</small>}
                        </div>

                        <div className="field">
                            <label htmlFor="user">Usuário</label>
                            <Dropdown optionLabel="name" value={profileUser.user} options={users} filter onChange={(e: DropdownChangeEvent) => onSelectUserChange(e.value)} placeholder='Selecione um usuário...'/>
                            {submitted && !profileUser.user && <small className="p-invalid">Usuário é obrigatório.</small>}
                        </div>

                    </Dialog>

                    <Dialog visible={deleteProfileUserDialog} style={{ width: '450px' }} header="Confirmar" modal footer={deleteProfileUserDialogFooter} onHide={hideDeleteProfileUserDialog}>
                        <div className="flex align-items-center justify-content-center">
                            <i className="pi pi-exclamation-triangle mr-3" style={{ fontSize: '2rem' }} />
                            {profileUser && (
                                <span>
                                    Você realmente deseja excluir o perfil-usuário <b>{profileUser.id}</b>?
                                </span>
                            )}
                        </div>
                    </Dialog>

                    <Dialog visible={deleteProfilesUsersDialog} style={{ width: '450px' }} header="Confirmar" modal footer={deleteProfilesUsersDialogFooter} onHide={hideDeleteProfilesUsersDialog}>
                        <div className="flex align-items-center justify-content-center">
                            <i className="pi pi-exclamation-triangle mr-3" style={{ fontSize: '2rem' }} />
                            {profilesUsers && <span>Você realmente deseja excluir os perfis-usuários selecionados?</span>}
                        </div>
                    </Dialog>
                </div>
            </div>
        </div>
    );
};

export default ProfileUser;
