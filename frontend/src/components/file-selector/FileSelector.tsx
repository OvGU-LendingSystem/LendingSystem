import { Button, Card, CardList, Divider, H3, Icon, NonIdealState } from '@blueprintjs/core';
import './FileSelector.css';
import { useRef } from 'react';
import { useField } from 'formik';
import { useFile } from '../../hooks/use-file';

export function FormikFileSelector({ name, title }: { name: string, title: string }) {
    const [ props, meta, helper ] = useField<File[]>(name);
    return <FileSelector files={meta.value} setFiles={async (val: File[]) => await helper.setValue(val)} title={title} />;
}

export function FileSelector({ files, setFiles, title }: { files: File[], setFiles: (files: File[]) => void, title: string }) {
    const fileInput = useRef<HTMLInputElement>(null);
    const selectFiles = async () => { fileInput.current?.click(); }
    
    const addFiles = (selectedFiles: File[]) => {
        files ? setFiles([...files, ...selectedFiles]) : setFiles(selectedFiles);
    }

    const deleteFile = (deletedFile: File) => {
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
            <Button onClick={selectFiles}>Select files</Button>
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
        <NonIdealState title='Drop pdf files here!' icon='cloud-upload' 
            action={<Button outlined icon='add' onClick={selectFiles}>Select files</Button>} />
    );
}

function FileListComponent({ files, deleteFile }: { files: File[], deleteFile: (file: File) => void }) {
    let currId = 1;
    const ids = new WeakMap();
    const getFileId = (file: File) => {
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

function FileListEntry({ file, deleteFile }: { file: File, deleteFile: (file: File) => void }) {
    const [ _, url, setFile ] = useFile(file);
    return (
        <Card interactive className='file-list-item' onClick={() => { window.open(url, '_blank') }}>
            {file.name}
            <Icon icon='trash' onClick={(e) => { deleteFile(file); e.stopPropagation(); e.preventDefault(); }} />
        </Card>
    );
}