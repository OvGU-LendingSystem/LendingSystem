import { MarkdownScreen } from "../markdown-screen/MarkdownScreen";
import { useQuery, gql, useMutation,} from '@apollo/client';

const GET_IMPRESSUM = gql`
    query {
        getImprint
    }
`;

export function ImpressumScreen() {

    const {data: impressum} = useQuery(GET_IMPRESSUM);
    
    return (
        <div dangerouslySetInnerHTML={impressum.getImprint}></div>
    )
}