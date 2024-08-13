import { FormikHelpers, Formik, FormikProps, Field, useField, Form } from "formik";
import { DragEvent, useState, useEffect, useRef, ReactElement } from "react";
import { MdAddAPhoto, MdArrowLeft, MdArrowRight, MdDelete } from "react-icons/md";
import { FormikInput, FormikSelectionInputWithCustomInput, FormikTextarea } from "../../core/input/Input";
import { AddInventoryItem, ImageResource } from "../../models/InventoryItem.model";

export interface ModifyInventoryProps {
    initialValue: AddInventoryItem,
    label: string,
    onClick: (values: AddInventoryItem) => Promise<void>
}

export function ModifyInventory({ initialValue, label, onClick }: ModifyInventoryProps) {
    const storagePlaces = ["Keller", "Regal 1", "Regal 2"];

    const updateDeposit = (e: React.ChangeEvent<HTMLInputElement>) => {
        return Math.trunc(e.target.valueAsNumber * 100);
    }

    const getDeposit = (val: number) => {
        return new Intl.NumberFormat(undefined, ({ maximumFractionDigits: 2, useGrouping: false })).format(val / 100);
    }

    const submit = async (values: AddInventoryItem, _: FormikHelpers<AddInventoryItem>) => {
        await onClick(values);
    }

    return (
        <div className='form-input--wrapper'>
            <Formik initialValues={initialValue} 
                onSubmit={submit}>{(props: FormikProps<AddInventoryItem>) => (
                <Form className='form-input'>
                    <div className='top-input--wrapper'>
                        <FormikImagesSelectorComponent name='images' />
                        <div className="side-input--wrapper">
                            <div className='text-input'>
                                <label htmlFor="name">Name</label>
                                <FormikInput fieldName='name' type="text" id="name" required />

                                <label htmlFor="inventory_number_internal">interne Inventarnummer</label>
                                <FormikInput fieldName='inventoryNumberInternal' getValue={(val) => val?.toString() ?? ''} modifier={(e) => { console.error(e); return e.target.valueAsNumber}} type="number" id="inventory_number_internal" />

                                <label htmlFor="inventory_number_external">externe Inventarnummer</label>
                                <FormikInput fieldName='inventoryNumberExternal' getValue={(val) => val?.toString() ?? ''} modifier={(e) => { console.error(e); return e.target.valueAsNumber}} type="number" id="inventory_number_external" />
                                
                                <label htmlFor="storage">Lagerort</label>
                                <FormikSelectionInputWithCustomInput fieldName='storageLocation' options={storagePlaces} />

                                <label htmlFor="deposit">Kaution</label>
                                <FormikInput fieldName='deposit' after={<div className='currency-placeholder'>€</div>} className='deposit-input' type="number" id="deposit" step={0.01} inputMode='numeric' min={0} required modifier={updateDeposit} getValue={getDeposit} />
                            </div>
                            <Field name='borrowable' type="checkbox" id="available" />
                            <label htmlFor="available">Öffentlich ausleihbar</label>
                        </div>
                    </div>

                    <label htmlFor='description'>Beschreibung</label>
                    <FormikTextarea id='description' rows={6} fieldName='description' />

                    <label htmlFor='defects'>Mängel</label>
                    <FormikTextarea id='defects' rows={6} fieldName='defects' />
                                        
                    <input type="submit" value={label} />
                </Form>
            )}
            </Formik>
        </div>
    );
}

function FormikImagesSelectorComponent({ name }: { name: string }) {
    const [ props, meta, helper ] = useField<ImageResource[]>('images');
    return <ImagesSelectorComponent images={meta.value} setImages={async (val: ImageResource[]) => await helper.setValue(val)} />
}

export interface ImagesSelectorProps {
    images: ImageResource[],
    setImages: (val: ImageResource[]) => void
}

function ImagesSelectorComponent({images, setImages}: ImagesSelectorProps) {
    const [ index, setIndex ] = useState(images.length);

    return (
        <div>
            <AddImageComponent images={images} setImages={setImages} currentImageIndex={index} setCurrentImageIndex={setIndex} />
            <MultiImagePreview images={images} currentIndex={index} setCurrentIndex={setIndex} />
        </div>
    )
}

export interface AddImageProps {
    images: ImageResource[],
    setImages: (images: ImageResource[]) => void,
    currentImageIndex: number,
    setCurrentImageIndex: (i: number) => void
}

function AddImageComponent({ images, setImages, currentImageIndex, setCurrentImageIndex }: AddImageProps) {
    const [ imageUrl, setImageUrl ] = useState<string | null>(null);

    useEffect(() => {
        if (currentImageIndex < images.length) {
            const currentImage = images[currentImageIndex];
            const [ url, cleanup ] = getImageUrlWithCleanupFn(currentImage);
            setImageUrl(url);
            return cleanup;
        } else {
            setImageUrl(null);
        }
    } , [currentImageIndex, images]);

    const fileInput = useRef<HTMLInputElement>(null);
    const getFile = async () => { fileInput.current?.click(); }
    
    const deleteImage = () => {
        setImages(
            images.filter((image, i) => i !== currentImageIndex)
        );
    }

    const handleImageSelection = (files: FileList) => {
        const i = currentImageIndex;
        const addedImageResources: ImageResource[] = [];
        for (const file of files) {
            addedImageResources.push({ type: 'local', file: file });
        }

        const newImages = [ ...images.slice(0, i), ...addedImageResources, ...images.slice(i)];
        setImages(newImages);
    }

    const onFileSelected = async (event: any) => {
        if (event.target.files) {
            handleImageSelection(event.target.files);            
        }
    }
    const onFileDropped = async (event: DragEvent) => {
        event.stopPropagation();
        event.preventDefault();
        
        if (event.dataTransfer.files) {
            handleImageSelection(event.dataTransfer.files);
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
                <input type='file' accept='image/*' multiple ref={fileInput} onChange={onFileSelected} />
                { imageUrl !== null || <MdAddAPhoto className='add-image--icon' onClick={getFile} /> }
            </div>

            <ImageControlsOverlay
                leftEnabled={currentImageIndex > 0}
                rightEnabled={currentImageIndex < images.length}
                deleteVisible={imageUrl !== null} 
                onLeftClick={() => setCurrentImageIndex(currentImageIndex - 1)}
                onRightClick={() => setCurrentImageIndex(currentImageIndex + 1)}
                onDeleteClick={deleteImage} />
        </div>
    );
}

function ImageControlsOverlay({leftEnabled, rightEnabled, deleteVisible, onLeftClick, onRightClick, onDeleteClick}: {leftEnabled: boolean, rightEnabled: boolean, deleteVisible: boolean,
    onLeftClick: () => void, onRightClick: () => void, onDeleteClick: () => void
}) {
    const callIfEnabled = (enabled: boolean, func: () => void) => {
        if (enabled) {
            func();
        }
    }

    return (
        <>
            <MdArrowLeft className={`left ${leftEnabled ? 'left-enabled' : 'left-disabled'}`} onClick={() => callIfEnabled(leftEnabled, onLeftClick)} />
            <MdArrowRight className={`right ${rightEnabled ? 'right-enabled' : 'right-disabled'}`} onClick={() => callIfEnabled(rightEnabled, onRightClick)} />
            { deleteVisible && <MdDelete className='top' onClick={onDeleteClick} /> }
        </>
    );
}

const BASE_IMAGE_PATH = process.env.REACT_APP_PICUTRES_BASE_URL;

function getImageUrlWithCleanupFn(image: ImageResource): [ url: string, cleanup: () => void ] {
    if (image.type === 'remote')
        return [ BASE_IMAGE_PATH + image.path, () => {} ];


    const url = URL.createObjectURL(image.file);
    const cleanup = () => {
        if (url !== null) {
            URL.revokeObjectURL(url);
        }
    };
    
    return [ url, cleanup ];
}

export interface MultiImagePreviewProps {
    images: ImageResource[],
    currentIndex: number,
    setCurrentIndex: (i: number) => void
}

function MultiImagePreview({images, currentIndex, setCurrentIndex}: MultiImagePreviewProps) {
    const index = Math.min(currentIndex, images.length - 1);

    const scrollerRef = useRef<HTMLUListElement>(null)
    const activeElemRef = useRef<HTMLLIElement>(null)
    const previews = images.map<ReactElement<HTMLUListElement>>((image, i) => {
        return <ImagePreview key={image.type === 'local' ? image.file.name : image.path} image={image} i={i} index={index} setCurrentIndex={setCurrentIndex} activeElemRef={activeElemRef} />
    });

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

    useEffect(onScrolled, [images]);

    const onClick = (left: boolean) => {
        if (!scrollerRef.current)
            return;

        const elemWidth = scrollerRef.current.scrollWidth / images.length;
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

function ImagePreview({ image, i, index, setCurrentIndex, activeElemRef }: { image: ImageResource, i: number, index: number, setCurrentIndex: (i: number) => void, activeElemRef: React.RefObject<HTMLLIElement> }) {
    const [ url, setUrl ] = useState('');
    useEffect(() => {
        const [ url, cleanup ] = getImageUrlWithCleanupFn(image);
        setUrl(url);
        return cleanup;
    }, [image]);

    return <li key={url} onClick={() => setCurrentIndex(i)}
                ref={i === index ? activeElemRef : null} className={i === index ? 'preview preview--active' : 'preview'}>
                <img src={url}></img>
            </li>
}