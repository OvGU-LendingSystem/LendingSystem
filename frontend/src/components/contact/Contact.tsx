import { MarkdownScreen } from "../markdown-screen/MarkdownScreen";
import { useQuery, gql, useMutation,} from '@apollo/client';

const GET_CONTACT = gql`
    query {
        getImprint
    }
`;

export function ContactScreen() {
    const {data: contact} = useQuery(GET_CONTACT);
        
    return (
        <div dangerouslySetInnerHTML={contact.getImprint}></div>
    )
}
