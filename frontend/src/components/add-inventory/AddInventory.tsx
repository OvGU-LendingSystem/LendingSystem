import { DragEvent, FormEvent, ReactElement, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import './AddInventory.css';
import { MdAddAPhoto, MdArrowLeft, MdArrowRight } from "react-icons/md";
import { Input } from '../../core/input/Input';
import { useFiles } from '../../hooks/use-files';

export function AddInventory() {
    const [images, imageUrls, setImages] = useFiles();
    const [deposit, setDeposit] = useState<string>('');

    const [storage, setStorage] = useState<string>('');
    const [showCustomStorageInput, setShowCustomStorageInput] = useState<boolean>(false);

    const storagePlaces = ["Keller", "Regal 1", "Regal 2"];

    useEffect(() => {
        setStorage(storagePlaces[0]);
    }, []);

    const updateDeposit = (e: any) => {
        setDeposit(new Intl.NumberFormat(undefined, { maximumFractionDigits: 2 }).format(e.target.valueAsNumber));
        e.preventDefault();
    }

    const submit = (event: any) => {
        console.error("Hello Add");
        console.error(storage);
        event.preventDefault();
    }

    const onStorageSelected = (e: any) => {
        const show = e.target.value === '';
        setShowCustomStorageInput(show);
        setStorage(e.target.value);
    }

    return (
        <div className='form-input--wrapper'>
            <form onSubmit={submit} className='form-input'>
                <div className='top-input--wrapper'>
                    <ImagesSelecorComponent images={images} imageUrls={imageUrls} setImages={setImages} />
                    <div className="side-input--wrapper">
                        <div className='text-input'>
                            <label htmlFor="name">Name</label>
                            <input type="text" id="name" required />
                            <label htmlFor="inventory_number">Inventarnummer</label>
                            <input type="text" id="inventory_number" />
                            <label htmlFor="description">Beschreibung</label>
                            <input type="text" id="description" />
                            <label htmlFor='owner'>Eigentümer</label>
                            <input type="text" id="owner" />
                            <label htmlFor="storage">Lagerort</label>
                            <div>
                                <select id="storage" value={showCustomStorageInput ? '' : storage} onChange={onStorageSelected}>
                                    {storagePlaces.map(name =>
                                        <option key={name} value={name}>{name}</option>
                                    )}
                                    <option value={''}>Custom</option>
                                </select>
                                { showCustomStorageInput && <input id='storage' type='text'  value={storage} onChange={(e) => setStorage(e.target.value)} /> }
                            </div>

                            <label htmlFor="deposit">Kaution</label>
                            {/*<input type="number" id="deposit" step={0.01} inputMode='numeric' min={0} required />*/}
                            <Input after={<div className='currency-placeholder'>€</div>} props={{type: "number", id: "deposit", step: 0.01, inputMode: 'numeric', min: 0, required: true, value: deposit, onInput: updateDeposit}} />
                        </div>
                        <input type="checkbox" id="available" />
                        <label htmlFor="available">Öffentlich ausleihbar</label>
                    </div>
                </div>
                
                <label htmlFor='defects'>Mängel</label>
                <textarea id='defects' rows={6} />
                
                <MultiImagePreview imageUrls={imageUrls} />

                <input type="submit" value="Add Object" />
            </form>
        </div>
    );
}

function ImagesSelecorComponent({images, imageUrls, setImages}: {  images: File[], imageUrls: string[], setImages: React.Dispatch<React.SetStateAction<File[]>> }) {
    return (
        <div>
            <AddImageComponent imageUrl={imageUrls.length == 0 ? null : null} setImage={(image) => image !== undefined ? setImages([...images, image]) : null} />
            <MultiImagePreview imageUrls={imageUrls} />
        </div>
    )
}

function AddImageComponent({imageUrl, setImage}: {imageUrl: string | null, setImage: (image: File | undefined) => any}) {
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
            { imageUrl !== null && <img src={imageUrl}></img> }
            <div className="add-image" onDragEnter={stopEvent} onDragOver={stopEvent} onDrop={onFileDropped}>
                <input type='file' accept='image/*' ref={fileInput} onChange={onFileSelected} />
                { imageUrl !== null || <MdAddAPhoto className='add-image--icon' onClick={getFile} /> }
            </div>
        </div>
    );
}

function MultiImagePreview({imageUrls}: {imageUrls: string[]}) {
    const [index, setIndex] = useState(0);

    const scrollerRef = useRef<HTMLUListElement>(null)
    const activeElemRef = useRef<HTMLLIElement>(null)
    const previews = imageUrls.map<ReactElement<HTMLUListElement>>((imageUrl, i) => 
        <li key={imageUrl} onClick={() => setIndex(i)} ref={i === index ? activeElemRef : null} className={i === index ? 'preview preview--active' : 'preview'}><img src={imageUrl}></img></li>
    );

    const [isAtStart, setIsAtStart] = useState(false);
    const [isAtEnd, setIsAtEnd] = useState(false);
    const onScrolled = () => {
        if (!scrollerRef.current) {
            setIsAtStart(false);
            setIsAtEnd(false);
            return;
        }

        const atStart = scrollerRef.current.scrollLeft === 0;
        const atEnd = scrollerRef.current.scrollWidth <= scrollerRef.current.scrollLeft + scrollerRef.current.offsetWidth;

        setIsAtStart(atStart);
        setIsAtEnd(atEnd);
    };

    useEffect(() => {
        if (!activeElemRef.current)
            return;

        activeElemRef.current.scrollIntoView({ behavior: 'smooth', inline: 'start' });
    }, [index]);

    useEffect(onScrolled, [imageUrls]);

    const onClick = (left: boolean) => {
        if (!scrollerRef.current)
            return;

        const elemWidth = scrollerRef.current.scrollWidth / imageUrls.length;
        scrollerRef.current.scrollBy({ left: left ? -elemWidth : elemWidth, behavior: 'smooth' });
    }

    const arrowBaseClass = 'multi-image-preview--nav';
    const leftArrowClassNames = arrowBaseClass + `${isAtStart ? ` ${arrowBaseClass}-disabled` :  ` ${arrowBaseClass}-enabled`}`;
    const rightArrowClassNames = arrowBaseClass + `${isAtEnd ? ` ${arrowBaseClass}-disabled` :  ` ${arrowBaseClass}-enabled`}`;

    return (
        <div className='multi-image-preview--wrapper'>
            <MdArrowLeft className={leftArrowClassNames} onClick={() => onClick(true)} />
            <ul className='multi-image-preview--image-list' ref={scrollerRef} onScroll={onScrolled}>
                {previews}
            </ul>
            <MdArrowRight className={rightArrowClassNames} onClick={() => onClick(false)} />
        </div>
    );
}