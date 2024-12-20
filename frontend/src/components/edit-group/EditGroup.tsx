import { useNavigate, useParams } from "react-router-dom";
import { useEditGroupMutation, useGetAddGroupItemByIdQuery } from "../../hooks/group-helpers";
import { AddGroupItem } from "../../models/group.model";
import { ModifyGroup } from "../modify-group/ModifyGroup";
import { useTitle } from "../../hooks/use-title";
import { Suspense } from "react";

export function EditGroup() {
    useTitle('Gruppe bearbeiten');
    
    const params = useParams<'groupId'>();
    const navigate = useNavigate();

    if (params['groupId'] === undefined) {
        navigate('/');
        return <></>;
    }
    
    return (
        <Suspense>
            <EditGroupScreen groupId={params['groupId']} />
        </Suspense>
    );
}

function EditGroupScreen({ groupId }: { groupId: string }) {
    const navigate = useNavigate();
    const [ editGroup ] = useEditGroupMutation();
    const { data } = useGetAddGroupItemByIdQuery(groupId);

    const submit = async (value: AddGroupItem) => {
        const result = await editGroup({ variables: { groupId: groupId, name: value.name, physicalObjects: value.physicalObjectIds } });
        if (result.success) {
            navigate('/internal/inventory');
        }
    }
    
    return (
        <>
            <ModifyGroup initialValue={data} onSubmit={submit} />
        </>
    );
}