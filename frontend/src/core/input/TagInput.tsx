import { useField } from "formik";
import { useGetTagsQuery } from "../../hooks/tag-helpers";
import { useCallback } from "react";
import { Tag } from "../../models/tag.model";
import { ItemPredicate, ItemRenderer, MultiSelect } from "@blueprintjs/select";
import { MenuItem } from "@blueprintjs/core";

export function FormikTagInput({ fieldName }: { fieldName: string }) {
    const [ field, meta, helper ] = useField<Tag[]>(fieldName);
    const tagsQuery = useGetTagsQuery();

    const areTagsEqual = useCallback((tagA: Tag, tagB: Tag) => {
        if (Object.hasOwn(tagA, 'id') !== Object.hasOwn(tagB, 'id')) return false;
        if (Object.hasOwn(tagA,'id') && Object.hasOwn(tagB, 'id')) return (tagA as any).id === (tagB as any).id;
        return tagA.tag === tagB.tag;
    }, []);

    const tagIsSelected = useCallback((tag: Tag) => {
        return field.value.findIndex((val) => areTagsEqual(val, tag)) !== -1;
    }, [areTagsEqual, field, field.value]);

    const removeTag = useCallback((idx: number) => {
        helper.setValue([...field.value.slice(0, idx), ...field.value.slice(idx + 1, undefined)]);
    }, [helper, field, field.value]);

    const tagRenderer: ItemRenderer<Tag> = (tag, props) => {
        if (!props.modifiers.matchesPredicate) {
            return null;
        }

        return (
            <MenuItem roleStructure='listoption' selected={tagIsSelected(tag)}
                shouldDismissPopover={false} text={tag.tag}
                active={props.modifiers.active} disabled={props.modifiers.disabled}
                key={tag.tag} onClick={props.handleClick} onFocus={props.handleFocus}
                ref={props.ref} />
        );
    }
    
    return <MultiSelect<Tag> selectedItems={field.value} items={tagsQuery.data}
        onItemSelect={(selectedTag, e) => {
            if (tagIsSelected(selectedTag)) {
                const tagIdx = field.value.findIndex((val) => areTagsEqual(val, selectedTag));
                removeTag(tagIdx);
            } else {
                helper.setValue([...field.value, selectedTag]);
            }
            e?.stopPropagation();
            e?.preventDefault();
        }}
        onItemsPaste={(tags) => {
            helper.setValue([...field.value, ...tags]);
        }}
        onClear={() => helper.setValue([])}
        createNewItemFromQuery={(query) => ({ tag: query })}
        createNewItemRenderer={(query, active, click) => <MenuItem icon='add'
            text={`neuen Tag "${query}" erstellen`} active={active}
            onClick={click} shouldDismissPopover={false} />
        }
        createNewItemPosition='first'
        itemsEqual={areTagsEqual}
        itemPredicate={filterTags}
        tagRenderer={(tag) => tag.tag}
        itemRenderer={tagRenderer}
        tagInputProps={{
            onRemove: (node, idx) => removeTag(idx),
            tagProps: { minimal: true }
        }}
        resetOnSelect
        placeholder='Auswählen...' />
}

const filterTags: ItemPredicate<Tag> = (query, tag, idx, exactMatch) => {
    const lowerQuery = query.trim().toLowerCase();
    const lowerTag = tag.tag.trim().toLowerCase();
    if (exactMatch) {
        return lowerQuery === lowerTag;
    }

    return lowerTag.includes(lowerQuery);
}