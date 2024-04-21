import { DragEvent, useRef } from 'react';
import './AddInventory.css';
import { MdAddAPhoto } from "react-icons/md";
import { useFile } from '../../hooks/use-file';



export function AddInventory() {
    const [image, imageUrl, setImage] = useFile();

    const submit = (event: any) => {
        console.error("Hello Add");
        event.preventDefault();
    }

    return (
        <form onSubmit={submit}>
            <AddImageComponent imageUrl={imageUrl} setImage={setImage} />
            <input type="text" />
            <input type="text" />
            <input type="text" />
            <input type="checkbox" />
            <input type="submit" value="Add Object" />
        </form>
    );
}

function AddImageComponent({imageUrl, setImage}: {imageUrl: string, setImage: React.Dispatch<React.SetStateAction<File | undefined>>}) {
    const fileInput = useRef<HTMLInputElement>(null);
    const getFile = async () => { fileInput.current?.click(); }
    
    const onFileSelected = async (event: any) => {
        if (event.target.files && event.target.files[0]) {
            setImage(event.target.files[0]);            
        }
    }
    const onFileDropped = async (event: DragEvent) => {
        event.stopPropagation();
        event.preventDefault();
        
        if (event.dataTransfer.files && event.dataTransfer.files[0]) {
            setImage(event.dataTransfer.files[0]);
        }
    }

    const stopEvent = async (event: any) => {
        event.stopPropagation();
        event.preventDefault();
    }

    return (
        <div className='add-image--wrapper'>
            <img src={imageUrl}></img>
            <div className="add-image" onDragEnter={stopEvent} onDragOver={stopEvent} onDrop={onFileDropped}>
                <input type='file' accept='image/*' ref={fileInput} onChange={onFileSelected} />
                { <MdAddAPhoto className='add-image--icon' onClick={getFile} /> }
            </div>
        </div>
    );
}