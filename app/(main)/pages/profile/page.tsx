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
import { ProfileService } from '@/service/ProfileService';

/* @todo Used 'as any' for types here. Will fix in next version due to onSelectionChange event type issue. */
const Profile = () => {
    let profileNull: Project.Profile = {
        id: 0,
        description: '',
    };

    const [profiles, setProfiles] = useState<Project.Profile[] | null>(null);
    const [profileDialog, setProfileDialog] = useState(false);
    const [deleteProfileDialog, setDeleteProfileDialog] = useState(false);
    const [deleteProfilesDialog, setDeleteProfilesDialog] = useState(false);
    const [profile, setProfile] = useState<Project.Profile>(profileNull);
    const [selectedProfiles, setSelectedProfiles] = useState<Project.Profile[]>([]);
    const [submitted, setSubmitted] = useState(false);
    const [globalFilter, setGlobalFilter] = useState('');
    const toast = useRef<Toast>(null);
    const dt = useRef<DataTable<any>>(null);
    const profileService = useMemo(() => new ProfileService(), []);


    useEffect(() => {
        if (!profiles) {
            profileService.findAll().then((response) => {
                console.log(response.data);
                setProfiles(response.data);
            }).catch((error) => {
                console.log(error);
            });
        }
    }, [profileService, profiles]);


    const openNew = () => {
        setProfile(profileNull);
        setSubmitted(false);
        setProfileDialog(true);
    };

    const hideDialog = () => {
        setSubmitted(false);
        setProfileDialog(false);
    };

    const hideDeleteProfileDialog = () => {
        setDeleteProfileDialog(false);
    };

    const hideDeleteProfilesDialog = () => {
        setDeleteProfilesDialog(false);
    };

    const saveProfile = () => {
        setSubmitted(true);

        if (!profile.id) {
            profileService.create(profile).then((response) => {
                setProfileDialog(false);
                setProfile(profileNull);
                setProfiles(null);
                toast.current?.show({
                    severity: 'info',
                    summary: 'Sucesso!',
                    detail: 'Perfil cadastrado com sucesso!'
                })
            }).catch((error) => {
                console.log(error.data.message);
                toast.current?.show({
                    severity: 'error',
                    summary: 'Erro!!',
                    detail: 'Erro ao salvar!'
                })
            })
        }
        else {
            profileService.update(profile).then((response) => {
                setProfileDialog(false);
                setProfile(profileNull);
                setProfiles(null);
                toast.current?.show({
                    severity: 'info',
                    summary: 'Sucesso!',
                    detail: 'Perfil alterado com sucesso!'
                })
            }).catch((error) => {
                console.log(error.data.message);
                toast.current?.show({
                    severity: 'error',
                    summary: 'Erro!!',
                    detail: 'Erro ao salvar!'
                })
            })
        }

    };

    const editProfile = (profile: Project.Profile) => {
        setProfile({ ...profile });
        setProfileDialog(true);
    };

    const confirmDeleteProfile = (profile: Project.Profile) => {
        setProfile(profile);
        setDeleteProfileDialog(true);
    };

    const deleteProfile = () => {
        if (profile.id) {
            profileService.delete(profile.id).then((response) => {
                setProfile(profileNull);
                setDeleteProfileDialog(false);
                setProfiles(null);
                toast.current?.show({
                    severity: "success",
                    summary: "Sucesso!",
                    detail: "Perfil deletado com sucesso!",
                    life: 3000
                })
            }).catch((error) => {
                toast.current?.show({
                    severity: "error",
                    summary: "Erro!",
                    detail: "Erro ao deletar perfil!",
                    life: 3000
                })
            })

        }
    };

    const exportCSV = () => {
        dt.current?.exportCSV();
    };

    const confirmDeleteSelected = () => {
        setDeleteProfilesDialog(true);
    };

    const deleteSelectedProfiles = () => {

        Promise.all(selectedProfiles.map(async (_profile) => {
            if (_profile.id) {
                await profileService.delete(_profile.id);
            }
        })).then((response) => {
            setProfiles(null);
            setSelectedProfiles([]);
            setDeleteProfilesDialog(false);
            toast.current?.show({
                severity: 'success',
                summary: 'Sucesso!',
                detail: 'Perfis deletados com Sucesso!',
                life: 3000
            });
        }).catch((error) => {
            toast.current?.show({
                severity: 'error',
                summary: 'Erro!',
                detail: 'Erro ao deletar perfis!',
                life: 3000
            })
        });
    };


    const onInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>, name: string) => {
        const val = (e.target && e.target.value) || '';
        //let _resource = { ...resource };
        //_user[`${name}`] = val;

        setProfile(prevProfile => ({
            ...prevProfile,
            [name]: val,
        }));
    };


    const leftToolbarTemplate = () => {
        return (
            <React.Fragment>
                <div className="my-2">
                    <Button label="Novo" icon="pi pi-plus" severity="success" className=" mr-2" onClick={openNew} />
                    <Button label="Excluir" icon="pi pi-trash" severity="danger" onClick={confirmDeleteSelected} disabled={!selectedProfiles || !(selectedProfiles as any).length} />
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

    const descriptionBodyTemplate = (rowData: Project.Profile) => {
        return (
            <>
                <span className="p-column-title">Descrição</span>
                {rowData.description}
            </>
        );
    };

    const actionBodyTemplate = (rowData: Project.Profile) => {
        return (
            <>
                <Button icon="pi pi-pencil" rounded severity="success" className="mr-2" onClick={() => editProfile(rowData)} />
                <Button icon="pi pi-trash" rounded severity="warning" onClick={() => confirmDeleteProfile(rowData)} />
            </>
        );
    };

    const header = (
        <div className="flex flex-column md:flex-row md:justify-content-between md:align-items-center">
            <h5 className="m-0">Gerenciamento de Perfis</h5>
            <span className="block mt-2 md:mt-0 p-input-icon-left">
                <i className="pi pi-search" />
                <InputText type="search" onInput={(e) => setGlobalFilter(e.currentTarget.value)} placeholder="Search..." />
            </span>
        </div>
    );

    const profileDialogFooter = (
        <>
            <Button label="Cancelar" icon="pi pi-times" text onClick={hideDialog} />
            <Button label="Salvar" icon="pi pi-check" text onClick={saveProfile} />
        </>
    );
    const deleteProfileDialogFooter = (
        <>
            <Button label="Não" icon="pi pi-times" text onClick={hideDeleteProfileDialog} />
            <Button label="Sim" icon="pi pi-check" text onClick={deleteProfile} />
        </>
    );
    const deleteProfilesDialogFooter = (
        <>
            <Button label="Não" icon="pi pi-times" text onClick={hideDeleteProfilesDialog} />
            <Button label="Sim" icon="pi pi-check" text onClick={deleteSelectedProfiles} />
        </>
    );

    return (
        <div className="grid crud-demo">
            <div className="col-12">
                <div className="card">
                    <Toast ref={toast} />
                    <Toolbar className="mb-4" left={leftToolbarTemplate} right={rightToolbarTemplate}></Toolbar>

                    <DataTable
                        ref={dt}
                        value={profiles}
                        selection={selectedProfiles}
                        onSelectionChange={(e) => setSelectedProfiles(e.value as any)}
                        dataKey="id"
                        paginator
                        rows={10}
                        rowsPerPageOptions={[5, 10, 25]}
                        className="datatable-responsive"
                        paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                        currentPageReportTemplate="Mostrando {first} até {last} de {totalRecords} perfis"
                        globalFilter={globalFilter}
                        emptyMessage="Nenhum perfil encontrado."
                        header={header}
                        responsiveLayout="scroll"
                    >
                        <Column selectionMode="multiple" headerStyle={{ width: '4rem' }}></Column>
                        <Column field="id" header="ID" sortable body={idBodyTemplate} headerStyle={{ minWidth: '15rem' }}></Column>
                        <Column field="description" header="Descrição" sortable body={descriptionBodyTemplate} headerStyle={{ minWidth: '15rem' }}></Column>
                        <Column body={actionBodyTemplate} headerStyle={{ minWidth: '10rem' }}></Column>
                    </DataTable>

                    <Dialog visible={profileDialog} style={{ width: '450px' }} header="Detalhes de perfil" modal className="p-fluid" footer={profileDialogFooter} onHide={hideDialog}>
                        <div className="field">
                            <label htmlFor="description">Descrição</label>
                            <InputText
                                id="description"
                                value={profile.description}
                                onChange={(e) => onInputChange(e, 'description')}
                                required
                                autoFocus
                                className={classNames({
                                    'p-invalid': submitted && !profile.description
                                })}
                            />
                            {submitted && !profile.description && <small className="p-invalid">Descrição é obrigatório.</small>}
                        </div>

                    </Dialog>

                    <Dialog visible={deleteProfileDialog} style={{ width: '450px' }} header="Confirmar" modal footer={deleteProfileDialogFooter} onHide={hideDeleteProfileDialog}>
                        <div className="flex align-items-center justify-content-center">
                            <i className="pi pi-exclamation-triangle mr-3" style={{ fontSize: '2rem' }} />
                            {profile && (
                                <span>
                                    Você realmente deseja excluir o perfil <b>{profile.id}</b>?
                                </span>
                            )}
                        </div>
                    </Dialog>

                    <Dialog visible={deleteProfilesDialog} style={{ width: '450px' }} header="Confirmar" modal footer={deleteProfilesDialogFooter} onHide={hideDeleteProfilesDialog}>
                        <div className="flex align-items-center justify-content-center">
                            <i className="pi pi-exclamation-triangle mr-3" style={{ fontSize: '2rem' }} />
                            {profiles && <span>Você realmente deseja excluir os perfis selecionados?</span>}
                        </div>
                    </Dialog>
                </div>
            </div>
        </div>
    );
};

export default Profile;
