import { MarkdownScreen } from "../markdown-screen/MarkdownScreen";
import { useQuery, gql, useMutation,} from '@apollo/client';

const GET_IMPRESSUM = gql`
    query GetImpressum {
        getImprint
    }
`;

export function ImpressumScreen() {

    const {data: impressum, loading} = useQuery(GET_IMPRESSUM);
    
    if (!loading && impressum!=null){ 
    
        return (
            <div style={{margin: '20px'}} dangerouslySetInnerHTML={{__html: impressum.getImprint}}></div>
        )
    }

    return <div>loading</div>
}