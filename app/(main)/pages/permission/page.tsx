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
import { PermissionService } from '@/service/PermissionService';
import { ResourceService } from '@/service/ResourceService';

/* @todo Used 'as any' for types here. Will fix in next version due to onSelectionChange event type issue. */
const Permission = () => {
    let permissionNull: Project.Permission = {
        id: 0,
        profile: {description: ''},
        resource: {name: '', key: ''}
    };

    const [permissions, setPermissions] = useState<Project.Permission[] | null>(null);
    const [permissionDialog, setPermissionDialog] = useState(false);
    const [deletePermissionDialog, setDeletePermissionDialog] = useState(false);
    const [deletePermissionsDialog, setDeletePermissionsDialog] = useState(false);
    const [permission, setPermission] = useState<Project.Permission>(permissionNull);
    const [selectedPermissions, setSelectedPermissions] = useState<Project.Permission[]>([]);
    const [submitted, setSubmitted] = useState(false);
    const [globalFilter, setGlobalFilter] = useState('');
    const toast = useRef<Toast>(null);
    const dt = useRef<DataTable<any>>(null);
    const permissionService = useMemo(() => new PermissionService(), []);
    const resourceService = useMemo(() => new ResourceService, [])
    const profileService = useMemo(() => new ProfileService, [])
    const [resources, setResources] = useState<Project.Resource[]>([])
    const [profiles, setProfiles] = useState<Project.Profile[]>([])

    useEffect(() => {
        if (!permissions) {
            permissionService.findAll().then((response) => {
                console.log(response.data);
                setPermissions(response.data);
            }).catch((error) => {
                console.log(error);
            });
        }
    }, [permissionService, permissions]);

    useEffect(() => {
        if(permissionDialog){
            resourceService.findAll().then((response) => setResources(response.data)).catch(error => {
                console.log(error);
                toast.current?.show({
                    severity: 'error',
                    summary: 'Erro!',
                    detail: 'Erro ao carregar a lista de recursos!'
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
    }, [permissionDialog, profileService, resourceService]);


    const openNew = () => {
        setPermission(permissionNull);
        setSubmitted(false);
        setPermissionDialog(true);
    };

    const hideDialog = () => {
        setSubmitted(false);
        setPermissionDialog(false);
    };

    const hideDeletePermissionDialog = () => {
        setDeletePermissionDialog(false);
    };

    const hideDeletePermissionsDialog = () => {
        setDeletePermissionsDialog(false);
    };

    const savePermission = () => {
        setSubmitted(true);

        if (!permission.id) {
            permissionService.create(permission).then((response) => {
                setPermissionDialog(false);
                setPermission(permissionNull);
                setPermissions(null);
                toast.current?.show({
                    severity: 'info',
                    summary: 'Sucesso!',
                    detail: 'Permissão cadastrada com sucesso!'
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
            permissionService.update(permission).then((response) => {
                setPermissionDialog(false);
                setPermission(permissionNull);
                setPermissions(null);
                toast.current?.show({
                    severity: 'info',
                    summary: 'Sucesso!',
                    detail: 'Permissão alterada com sucesso!'
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

    const editPermission = (permission: Project.Permission) => {
        setPermission({ ...permission });
        setPermissionDialog(true);
    };

    const confirmDeletePermission = (permission: Project.Permission) => {
        setPermission(permission);
        setDeletePermissionDialog(true);
    };

    const deletePermission = () => {
        if (permission.id) {
            permissionService.delete(permission.id).then((response) => {
                setPermission(permissionNull);
                setDeletePermissionDialog(false);
                setPermissions(null);
                toast.current?.show({
                    severity: "success",
                    summary: "Sucesso!",
                    detail: "Permissão deletada com sucesso!",
                    life: 3000
                })
            }).catch((error) => {
                toast.current?.show({
                    severity: "error",
                    summary: "Erro!",
                    detail: "Erro ao deletar permissão!",
                    life: 3000
                })
            })

        }
    };

    const exportCSV = () => {
        dt.current?.exportCSV();
    };

    const confirmDeleteSelected = () => {
        setDeletePermissionsDialog(true);
    };

    const deleteSelectedPermissions = () => {

        Promise.all(selectedPermissions.map(async (_permission) => {
            if (_permission.id) {
                await permissionService.delete(_permission.id);
            }
        })).then((response) => {
            setPermissions(null);
            setSelectedPermissions([]);
            setDeletePermissionsDialog(false);
            toast.current?.show({
                severity: 'success',
                summary: 'Sucesso!',
                detail: 'Permissões deletadas com sucesso!',
                life: 3000
            });
        }).catch((error) => {
            toast.current?.show({
                severity: 'error',
                summary: 'Erro!',
                detail: 'Erro ao deletar permissões!',
                life: 3000
            })
        });
    };


    const onInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>, name: string) => {
        const val = (e.target && e.target.value) || '';
        //let _resource = { ...resource };
        //_user[`${name}`] = val;

        setPermission(prevPermission => ({
            ...prevPermission,
            [name]: val,
        }));
    };


    const leftToolbarTemplate = () => {
        return (
            <React.Fragment>
                <div className="my-2">
                    <Button label="Novo" icon="pi pi-plus" severity="success" className=" mr-2" onClick={openNew} />
                    <Button label="Excluir" icon="pi pi-trash" severity="danger" onClick={confirmDeleteSelected} disabled={!selectedPermissions || !(selectedPermissions as any).length} />
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

    const idBodyTemplate = (rowData: Project.Permission) => {
        return (
            <>
                <span className="p-column-title">Id</span>
                {rowData.id}
            </>
        );
    };

    const profileBodyTemplate = (rowData: Project.Permission) => {
        return (
            <>
                <span className="p-column-title">Perfil</span>
                {rowData.profile.description}
            </>
        );
    };

    const resourceBodyTemplate = (rowData: Project.Permission) => {
        return (
            <>
                <span className="p-column-title">Recurso</span>
                {rowData.resource.name}
            </>
        );
    };

    const actionBodyTemplate = (rowData: Project.Permission) => {
        return (
            <>
                <Button icon="pi pi-pencil" rounded severity="success" className="mr-2" onClick={() => editPermission(rowData)} />
                <Button icon="pi pi-trash" rounded severity="warning" onClick={() => confirmDeletePermission(rowData)} />
            </>
        );
    };

    const header = (
        <div className="flex flex-column md:flex-row md:justify-content-between md:align-items-center">
            <h5 className="m-0">Gerenciamento de permissões</h5>
            <span className="block mt-2 md:mt-0 p-input-icon-left">
                <i className="pi pi-search" />
                <InputText type="search" onInput={(e) => setGlobalFilter(e.currentTarget.value)} placeholder="Search..." />
            </span>
        </div>
    );

    const permissionDialogFooter = (
        <>
            <Button label="Cancelar" icon="pi pi-times" text onClick={hideDialog} />
            <Button label="Salvar" icon="pi pi-check" text onClick={savePermission} />
        </>
    );
    const deletePermissionDialogFooter = (
        <>
            <Button label="Não" icon="pi pi-times" text onClick={hideDeletePermissionDialog} />
            <Button label="Sim" icon="pi pi-check" text onClick={deletePermission} />
        </>
    );
    const deletePermissionsDialogFooter = (
        <>
            <Button label="Não" icon="pi pi-times" text onClick={hideDeletePermissionsDialog} />
            <Button label="Sim" icon="pi pi-check" text onClick={deleteSelectedPermissions} />
        </>
    );

    const onSelectProfileChange = (profile: Project.Profile) => {
        let _permission = { ...permission};
        _permission.profile = profile;
        setPermission(_permission);
    }

    const onSelectResourceChange = (resource: Project.Resource) => {
        let _permission = { ...permission};
        _permission.resource = resource;
        setPermission(_permission);
    }

    return (
        <div className="grid crud-demo">
            <div className="col-12">
                <div className="card">
                    <Toast ref={toast} />
                    <Toolbar className="mb-4" left={leftToolbarTemplate} right={rightToolbarTemplate}></Toolbar>

                    <DataTable
                        ref={dt}
                        value={permissions}
                        selection={selectedPermissions}
                        onSelectionChange={(e) => setSelectedPermissions(e.value as any)}
                        dataKey="id"
                        paginator
                        rows={10}
                        rowsPerPageOptions={[5, 10, 25]}
                        className="datatable-responsive"
                        paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                        currentPageReportTemplate="Mostrando {first} até {last} de {totalRecords} permissões"
                        globalFilter={globalFilter}
                        emptyMessage="Nenhuma permissão encontrada."
                        header={header}
                        responsiveLayout="scroll"
                    >
                        <Column selectionMode="multiple" headerStyle={{ width: '4rem' }}></Column>
                        <Column field="id" header="ID" sortable body={idBodyTemplate} headerStyle={{ minWidth: '15rem' }}></Column>
                        <Column field="profile" header="Perfil" sortable body={profileBodyTemplate} headerStyle={{ minWidth: '15rem' }}></Column>
                        <Column field="resource" header="Recurso" sortable body={resourceBodyTemplate} headerStyle={{ minWidth: '15rem' }}></Column>
                        <Column body={actionBodyTemplate} headerStyle={{ minWidth: '10rem' }}></Column>
                    </DataTable>

                    <Dialog visible={permissionDialog} style={{ width: '450px' }} header="Detalhes de permissão" modal className="p-fluid" footer={permissionDialogFooter} onHide={hideDialog}>
                        <div className="field">
                            <label htmlFor="profile">Perfil</label>
                            <Dropdown optionLabel="description" value={permission.profile} options={profiles} filter onChange={(e: DropdownChangeEvent) => onSelectProfileChange(e.value)} placeholder='Selecione um perfil...'/>
                            {submitted && !permission.profile && <small className="p-invalid">Perfil é obrigatório.</small>}
                        </div>

                        <div className="field">
                            <label htmlFor="resource">Recurso</label>
                            <Dropdown optionLabel="name" value={permission.resource} options={resources} filter onChange={(e: DropdownChangeEvent) => onSelectResourceChange(e.value)} placeholder='Selecione um recurso...'/>
                            {submitted && !permission.resource && <small className="p-invalid">Recurso é obrigatório.</small>}
                        </div>

                    </Dialog>

                    <Dialog visible={deletePermissionDialog} style={{ width: '450px' }} header="Confirmar" modal footer={deletePermissionDialogFooter} onHide={hideDeletePermissionDialog}>
                        <div className="flex align-items-center justify-content-center">
                            <i className="pi pi-exclamation-triangle mr-3" style={{ fontSize: '2rem' }} />
                            {permission && (
                                <span>
                                    Você realmente deseja excluir a permissão <b>{permission.id}</b>?
                                </span>
                            )}
                        </div>
                    </Dialog>

                    <Dialog visible={deletePermissionsDialog} style={{ width: '450px' }} header="Confirmar" modal footer={deletePermissionsDialogFooter} onHide={hideDeletePermissionsDialog}>
                        <div className="flex align-items-center justify-content-center">
                            <i className="pi pi-exclamation-triangle mr-3" style={{ fontSize: '2rem' }} />
                            {permission && <span>Você realmente deseja excluir as permissões selecionadas?</span>}
                        </div>
                    </Dialog>
                </div>
            </div>
        </div>
    );
};

export default Permission;
