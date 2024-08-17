import { useNavigate } from "react-router-dom";
import { useAddGroupMutation } from "../../hooks/group-helpers";
import { AddGroupItem } from "../../models/group.model";
import { ModifyGroup } from "../modify-group/ModifyGroup";

export function AddGroup() {
    const navigate = useNavigate();
    const [ addGroup ] = useAddGroupMutation();

    const initialValue: AddGroupItem = {
        name: '', pictures: [], physicalObjectIds: []
    }

    const submit = async (value: AddGroupItem) => {
        // TODO images
        const result = await addGroup({ variables: { name: value.name, physicalObjects: value.physicalObjectIds } });
        if (result.success) {
            navigate('/');
        }
    }
    
    return (
        <>
            <ModifyGroup initialValue={initialValue} onSubmit={submit} />
        </>
    );
}