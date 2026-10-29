// El encabezado del altar.
//
// El nombre de quien lo arma va aqui, no en el formulario de agregar
// elementos: es de la persona, no de la vela. Se escribe una vez y se
// queda.

export default function Encabezado({ nombre, onNombre }) {
  return (
    <header>
      <p className="encabezado-eyebrow">Día de Muertos</p>
      <h1>
        La <span>ofrenda</span> 
      </h1>
      <p className="encabezado-sub">
        <label htmlFor="nombre">Lo está armando</label>
        <input
          id="nombre"
          className="encabezado-nombre"
          type="text"
          maxLength={40}
          placeholder="tu nombre"
          value={nombre}
          onChange={(e) => onNombre(e.target.value)}
        />
      </p>
    </header>
  )
}
