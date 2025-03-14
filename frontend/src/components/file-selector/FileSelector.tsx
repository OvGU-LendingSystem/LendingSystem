import { Button, Card, CardList, Divider, H3, Icon, NonIdealState } from '@blueprintjs/core';
import './FileSelector.css';
import { useRef } from 'react';
import { useField } from 'formik';
import { usePdfResource } from '../../hooks/use-file';
import { FileResource, LocalFile } from '../../models/file.model';

export function FormikFileSelector({ name, title }: { name: string, title: string }) {
    const [ props, meta, helper ] = useField<FileResource[]>(name);
    return <FileSelector files={meta.value} setFiles={async (val: FileResource[]) => await helper.setValue(val)} title={title} />;
}

export function FileSelector({ files, setFiles, title }: { files: FileResource[], setFiles: (files: FileResource[]) => void, title: string }) {
    const fileInput = useRef<HTMLInputElement>(null);
    const selectFiles = async () => { fileInput.current?.click(); }
    
    const addFiles = (selectedFiles: File[]) => {
        const selectedFileResources = selectedFiles.map((file) => {
            const res: LocalFile = { type: 'local', file: file };
            return res;
        });
        files ? setFiles([...files, ...selectedFileResources]) : setFiles(selectedFileResources);
    }

    const deleteFile = (deletedFile: FileResource) => {
        setFiles(files.filter((file) => file !== deletedFile));
    }

    const stopEvent = async (event: any) => {
        event.stopPropagation();
        event.preventDefault();
    }

    const onFileSelected = async (e: any) => {
        e.stopPropagation();
        e.preventDefault();

        const files = e.target.files;
        const filesWithType = Array(...files).filter((file) => file.type === 'application/pdf');
        addFiles(filesWithType);
    }

    const dropFiles = async (e: React.DragEvent<HTMLDivElement>) => {
        e.stopPropagation();
        e.preventDefault();

        const files = e.dataTransfer.files;
        const filesWithType = Array(...files).filter((file) => file.type === 'application/pdf');
        addFiles(filesWithType);
    }

    return (
        <Card>
            <H3>{title}</H3>
            <Divider />
            <Button onClick={selectFiles}>Dateien auswählen</Button>
            <input type='file' accept='application/pdf' multiple ref={fileInput} onChange={onFileSelected} className='file-input-handler' />
            <div className='file-drop-target' onDragEnter={stopEvent} onDragOver={stopEvent} onDrop={dropFiles}>
                {
                    files && files.length > 0
                    ? <FileListComponent files={files} deleteFile={deleteFile} />
                    : <NoFileSelectedComponent selectFiles={selectFiles} />
                }
            </div>
        </Card>
    );
}

function NoFileSelectedComponent({ selectFiles }: { selectFiles: () => Promise<void> }) {
    return (
        <NonIdealState title='Pdf Dateien hier ablegen!' icon='cloud-upload' 
            action={<Button outlined icon='add' onClick={selectFiles}>Dateien auswählen</Button>} />
    );
}

function FileListComponent({ files, deleteFile }: { files: FileResource[], deleteFile: (file: FileResource) => void }) {
    let currId = 1;
    const ids = new WeakMap();
    const getFileId = (file: FileResource) => {
        if (ids.has(file))
            return ids.get(file);

        const id = currId++;
        ids.set(file, id);
        return id;
    }

    return (
        <CardList>
            {
                files.map((file) => <FileListEntry file={file} deleteFile={deleteFile} key={getFileId(file)} />)
            }
        </CardList>
    );
}

function FileListEntry({ file, deleteFile }: { file: FileResource, deleteFile: (file: FileResource) => void }) {
    const url = usePdfResource(file);
    return (
        <Card interactive className='file-list-item' onClick={() => { window.open(url, '_blank') }}>
            {file.type === 'local' ? file.file.name : file.path }
            <Icon icon='trash' onClick={(e) => { deleteFile(file); e.stopPropagation(); e.preventDefault(); }} />
        </Card>
    );
}