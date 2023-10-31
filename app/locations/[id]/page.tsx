

interface Props {
    params: {
        id: string
    }
}
export default function Days ({params}: Props) {
    return(
        <>{params.id}</>
    )
};