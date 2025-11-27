export default function Nav({children, ClaseNav}){
    return(
        <nav className={ClaseNav}>
            {children}
        </nav>
    )
}
