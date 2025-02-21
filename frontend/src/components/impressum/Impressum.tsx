import { MarkdownScreen } from "../markdown-screen/MarkdownScreen";
import { useQuery, gql, useMutation,} from '@apollo/client';

const GET_IMPRESSUM = gql`
    query GetImpressum {
        getImprint
    }
`;

export function ImpressumScreen() {

    const {data: impressum} = useQuery(GET_IMPRESSUM);
    console.log(impressum);
    
    return (
        <div dangerouslySetInnerHTML={impressum.getImprint}></div>
    )
}