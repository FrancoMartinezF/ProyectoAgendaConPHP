const formularioContactos = document.querySelector('#contacto'),
    listadoContactos = document.querySelector('#listado-contactos tbody');
inputBuscador = document.querySelector('#buscar');
eventListeners();

function eventListeners() {
    //cuando el formulario de crear o editar se ejecuta
    formularioContactos.addEventListener('submit', leerFormulario);
    //listener para boton eliminar
    if (listadoContactos) {
        listadoContactos.addEventListener('click', eliminarContacto);
    }
    //buscador
    inputBuscador.addEventListener('input', buscarContactos);

    //contador contactos
    numeroContactos();


}

function leerFormulario(e) {
    e.preventDefault();
    //leer datos de los inputs
    const nombre = document.querySelector('#nombre').value,
        empresa = document.querySelector('#empresa').value,
        telefono = document.querySelector('#telefono').value,
        accion = document.querySelector('#accion').value;
    if (nombre === '' || empresa === '' || telefono === '') {
        mostrarNotificacion('Todos los campos son obligatorios', 'error');
    } else {
        //Llamado a AJAX
        const infoContacto = new FormData();
        infoContacto.append('nombre', nombre);
        infoContacto.append('empresa', empresa);
        infoContacto.append('telefono', telefono);
        infoContacto.append('accion', accion);


        if (accion === 'crear') {
            //creamos un nuevo contacto
            insertarBD(infoContacto);
        } else {
            //editamos el contacto
            //leer id
            const idRegistro = document.querySelector('#id').value;
            infoContacto.append('id', idRegistro);
            actualizarRegistro(infoContacto);
        }
    }
}

//Funcion para insertar en la base de datos
function insertarBD(datos) {
    // llamada a ajax

    //crear el objeto
    const xhr = new XMLHttpRequest();
    //abrir la conexion
    xhr.open('POST', 'inc/modelos/modelo-contactos.php', true);
    //pasar los datos
    xhr.onload = function() {
            if (this.status === 200) {
                console.log(JSON.parse(xhr.responseText));
                //leemos la respuesta de PHP
                const respuesta = JSON.parse(xhr.responseText);
                //Inserta un nuevo elemento a la tabla
                const nuevoContacto = document.createElement('tr');
                nuevoContacto.innerHTML = `
                    <td class="td-centrar">${respuesta.datos.nombre}</td>
                    <td class="td-centrar">${respuesta.datos.empresa}</td>
                    <td class="td-centrar">${respuesta.datos.telefono}</td>
                `;
                //crear contenedor para los botones
                const contenedorAcciones = document.createElement('td');
                //crear el icono de editar
                const iconoEditar = document.createElement('i');
                iconoEditar.classList.add('fas', 'fa-pen-square');
                //Crear el enlace para editar
                const btnEditar = document.createElement('a');
                btnEditar.appendChild(iconoEditar);
                btnEditar.href = `editar.php?id=${respuesta.datos.empresa.id_insertado}`;
                btnEditar.classList.add('btn', 'btn-editar');

                //agregarlo al padre
                contenedorAcciones.appendChild(btnEditar);
                //crear el icono de eliminar
                const iconoEliminar = document.createElement('i');
                iconoEliminar.classList.add('fas', 'fa-trash-alt');
                //crear boton de eliminar
                const btnEliminar = document.createElement('button');
                btnEliminar.appendChild(iconoEliminar);
                btnEliminar.setAttribute('data-id', respuesta.datos.id_insertado);
                btnEliminar.classList.add('btn', 'btn-borrar');
                //agregarlo al padre
                contenedorAcciones.appendChild(btnEliminar);
                //Agregarlo al tr
                nuevoContacto.appendChild(contenedorAcciones);
                //agregarlo con los contactos
                listadoContactos.appendChild(nuevoContacto);
                //resetear el formulario
                document.querySelector('form').reset();
                //mostrar la notificacion
                mostrarNotificacion('Contacto creado exitosamente', 'correcto');
                //Actualizar el numero
                numeroContactos();
            }
        }
        //enviar los datos
    xhr.send(datos);
}

function actualizarRegistro(datos) {
    //crear objeto
    const xhr = new XMLHttpRequest();
    //abrir conexion
    xhr.open('POST', 'inc/modelos/modelo-contactos.php', true);
    //leer respuesta
    xhr.onload = function() {
            if (this.status === 200) {
                const respuesta = JSON.parse(xhr.responseText);
                if (respuesta.respuesta === 'correcto') {
                    //mostrar notificacion de correcto
                    mostrarNotificacion('Contacto editado correctamente', 'correcto');
                } else {
                    //hubo un error
                    mostrarNotificacion('Hubo un error...', 'error');
                }
            }
        }
        //enviar peticion
    xhr.send(datos);
}

//Eliminar un contacto
function eliminarContacto(e) {
    if (e.target.parentElement.classList.contains('btn-borrar')) {
        //tomar el id
        const id = e.target.parentElement.getAttribute('data-id');
        const url = `inc/modelos/modelo-contactos.php?id=${id}&accion=borrar`;
        //console.log(id);
        //Preguntar si estan seguros
        const respuesta = confirm('¿Estás seguro de eliminar?');
        if (respuesta === true) {
            //llamado a ajax
            //crear el objeto
            const xhr = new XMLHttpRequest();
            //abrir la conexion
            xhr.open('GET', url, true);
            //leer la respuesta

            xhr.onload = function() {
                    if (xhr.status === 200) {
                        const resultado = JSON.parse(xhr.responseText);
                        if (resultado.respuesta === 'correcto') {
                            //eliminar el registro del DOM
                            e.target.parentElement.parentElement.parentElement.remove();
                            //Mostrar notificacion
                            mostrarNotificacion('Contacto eliminado', 'correcto');
                            //Actualizar el numero
                            numeroContactos();
                        } else {
                            //Mostramos una notificacion
                            mostrarNotificacion('Hubo un error...', 'error');
                        }
                    }
                }
                //enviar la peticion
            xhr.send();
        }
    }
}

//Notificacion en pantalla
function mostrarNotificacion(mensaje, clase) {
    const notificacion = document.createElement('div');
    notificacion.classList.add(clase, 'notificacion', 'sombra');
    notificacion.textContent = mensaje;

    //formulario
    formularioContactos.insertBefore(notificacion, document.querySelector('form legend'));

    //Ocultar y mostrar la notifacion
    setTimeout(() => {
        notificacion.classList.add('visible');

        setTimeout(() => {
            notificacion.classList.remove('visible');
            setTimeout(() => {
                notificacion.remove();
            }, 500);
        }, 3000);
    }, 100);
}

//buscador de contactos
function buscarContactos(e) {
    const expresion = new RegExp(e.target.value, "i");
    registros = document.querySelectorAll('tbody tr');

    registros.forEach(registro => {
        registro.style.display = 'none';

        if (registro.childNodes[1].textContent.replace(/\s/g, " ").search(expresion) != -1) {
            registro.style.display = 'table-row';
        }
        numeroContactos();
    });
}

//Contador de contactos
function numeroContactos() {
    const totalContactos = document.querySelectorAll('tbody tr');
    const contenedorNumero = document.querySelector('.total-contactos span');
    let total = 0;
    totalContactos.forEach(contacto => {
        if (contacto.style.display === '' || contacto.style.display === 'table-row') {
            total++;
        }
    });
    //console.log(total);
    contenedorNumero.textContent = total;
}