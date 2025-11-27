export default function Imagen({ src, alt, estilo, height, width, funcion, align }) {
    return (
        <img src={src} alt={alt} className={estilo} height={height} width={width} onClick={funcion}/>
    );
}