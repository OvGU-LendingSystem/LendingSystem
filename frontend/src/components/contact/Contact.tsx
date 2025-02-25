import { MarkdownScreen } from "../markdown-screen/MarkdownScreen";
import { useQuery, gql, useMutation,} from '@apollo/client';

//TODO
const GET_CONTACT = gql`
    query GetContact {
        getContactInformation
    }
`;

export function ContactScreen() {

    const {data: contact, loading} = useQuery(GET_CONTACT);
    
    if (!loading && contact!=null){     
    
        return (
            <div style={{margin: '20px'}} dangerouslySetInnerHTML={{__html: contact.getContactInformation}}></div>
        )
    }

    return <div>loading</div>
}