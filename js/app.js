/** 3 Endpoints
 * Uno para categorías, 
 * uno para los platillos que pertenecen a esa categoría 
 * La información del platillo en específico. 
 */
function iniciarApp() {

    const resultado = document.querySelector('#resultado');

    const selectCategorias = document.querySelector('#categorias');
    if (selectCategorias) {
        selectCategorias.addEventListener('change', seleccionarCategoria);
        obtenerCategorias();
    }

    const favoritosDiv = document.querySelector('.favoritos');
    if(favoritosDiv) {
        obtenerFavoritos();
    }

    const modal = new bootstrap.Modal('#modal', {});

    function obtenerCategorias() {

        const url = 'https://www.themealdb.com/api/json/v1/1/categories.php';
        fetch(url) /** Como es de tipo GET no tienes que especificar nada más; por default es este tipo de GET, entonces solamente le pasas la URL. */
            /** Aquí se pasa en automático un parámetro que tú puedes nombrarlo como desees. */
            .then(restpuesta => restpuesta.json())
            /** console.log(restpuesta);  Aquí nos va a decir si el llamado fue correcto o no (Response - status: 200). */
            /** Entonces voy a tener un segundo .then; está en automático. Se le pasa otro parámetro, lo puedes nombrar com desees. */
            .then(resultado => mostrarCategorias(resultado.categories)); /** (14) [{…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}] */
    }

    function mostrarCategorias(categorias = []) {

        categorias.forEach(categoria => {

            const { strCategory } = categoria;

            const option = document.createElement('OPTION');
            /** option.value = categoria.strCategory;
            option.textContent = categoria.strCategory; */
            option.value = strCategory;
            option.textContent = strCategory;

            /** console.log(option); <option value="Beef"> */
            selectCategorias.appendChild(option);
        });
    }

    function seleccionarCategoria(e) {
        // console.log(e.target.value);
        const categoria = e.target.value;

        const url = `https://www.themealdb.com/api/json/v1/1/filter.php?c=${categoria}`;

        fetch(url)
            .then(restpuesta => restpuesta.json())
            .then(resultado => mostrarRecetas(resultado.meals)); /** Está consultando en base a la selección del usuario, trae las recetas que pertenecen a esa categoría. */
    }

    function mostrarRecetas(recetas = []) {
        /** console.log(recetas); Array(42) [ {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, … ] */
        limpiarHTML(resultado);

        const heading = document.createElement('H2');
        heading.classList.add('text-center', 'text-black', 'my-5');
        heading.textContent = recetas.length ? 'Resultados' : 'No Hay Resultados';
        resultado.appendChild(heading);

        /** Iterar en los Resultados */
        recetas.forEach(receta => {

            // console.log(receta);

            const { idMeal, strMeal, strMealThumb } = receta;

            const recetaContenedor = document.createElement('DIV');
            recetaContenedor.classList.add('col-md-4');

            const recetaCard = document.createElement('DIV');
            recetaCard.classList.add('card', 'mb-4');

            const recetaImagen = document.createElement('IMG');
            recetaImagen.classList.add('card-img-top');
            recetaImagen.alt = `Imagen de la receta ${strMeal ?? receta.titulo}`; /** Texto alternativo */
            recetaImagen.src = strMealThumb ?? receta.img;

            /** El Card debe tener un Body */
            const recetaCardBody = document.createElement('DIV');
            recetaCardBody.classList.add('card-body');

            const recetaHeading = document.createElement('H3');
            recetaHeading.classList.add('card-title', 'mb-3');
            recetaHeading.textContent = strMeal ?? receta.titulo;

            const recetaButton = document.createElement('BUTTON');
            recetaButton.classList.add('btn', 'btn-danger', 'w-100');
            recetaButton.textContent = 'Ver Receta';
            // recetaButton.dataset.bsTarget = "#modal"; // <button> data-bs-target="#modal" </button>
            // recetaButton.dataset.bsToggle = "modal"; // <button> data-bs-toggle="modal" </button>

            /**Mandar a llamar otra función, que consulte la API y que se traiga esa receta en específico **/
            /** Aquí utilizamos onclick porque este elemento no existe, no va a existir en el código HTML cuando el código de JavaScript se ejecute, sino que se genera hasta que el usuario selecciona algunas opciones. un eventListener no te serviría. */
            recetaButton.onclick = function () {
                seleccionarReceta(idMeal ?? receta.id)
            }

            /** Inyectar en el código HTML */
            /**
             * contenedorCard
             *   .card
             *      img
             *      .cardBody
             *           h3
             *           button
             */
            recetaCardBody.appendChild(recetaHeading);
            recetaCardBody.appendChild(recetaButton);

            recetaCard.appendChild(recetaImagen);
            recetaCard.appendChild(recetaCardBody);

            recetaContenedor.appendChild(recetaCard);

            /** Muy importante es que este receta contenedor es algo que nosotros estamos generando con scripting; Entonces, se tienes que tomar un elemento real del código HTML, algo que sí esté disponible para entonces inyectar todo este código que se ha generado Y para ello tenemos este div con la ide de resultado que está vacío. */
            resultado.appendChild(recetaContenedor);

        })
    }

    function seleccionarReceta(id) {
        // console.log(id)
        const url = `https://themealdb.com/api/json/v1/1/lookup.php?i=${id}`;

        fetch(url)
            .then(respuesta => respuesta.json())
            .then(reslutado => mostrarRecetaModal(reslutado.meals[0]));
    }

    function mostrarRecetaModal(receta) {

        // console.log(receta);

        const { idMeal, strInstructions, strMeal, strMealThumb } = receta;

        // Añadir contenido al Modal
        const modalTitle = document.querySelector('.modal .modal-title');
        const modalBody = document.querySelector('.modal .modal-body');

        modalTitle.textContent = strMeal;

        modalBody.innerHTML = `
            <img class="img-fluid" src="${strMealThumb}" alt="${strMeal}" />
            <h3 class="my-3">Instrucciones</h3>
            <p>${strInstructions}</p>
            <h3 class="my-3">Ingredientes y Cantidades</h3>
        `;

        const listGroup = document.createElement('UL');
        listGroup.classList.add('list-group');
        /** Mostrar cantidades e ingredientes */
        for (let i = 1; i <= 20; i++) {

            // console.log(receta[`strIngredient${i}`]);

            if (receta[`strIngredient${i}`]) {
                const ingrediente = receta[`strIngredient${i}`];
                const cantidad = receta[`strMeasure${i}`];

                const ingredienteLi = document.createElement('LI');
                ingredienteLi.classList.add('list-group-item');
                ingredienteLi.textContent = `${ingrediente} - ${cantidad}`;

                listGroup.appendChild(ingredienteLi);
            }
        }

        modalBody.appendChild(listGroup);

        const modalFooter = document.querySelector('.modal-footer');

        limpiarHTML(modalFooter);

        /** Botones de Agregar Favorito y Cerrar */
        const btnFavorito = document.createElement('BUTTON');
        btnFavorito.classList.add('btn', 'btn-danger', 'col');
        btnFavorito.textContent = existeStorage(idMeal) ? 'Eliminar Favorito' : 'Guardar Favorito';

        /** LocalStorage */
        btnFavorito.onclick = function () {

            if (existeStorage(idMeal)) {
                eliminarFavorito(idMeal);
                btnFavorito.textContent = 'Guardar Favorito';
                mostrarToast('Eliminado Correctamente');
                return
            }

            agregarFavorito({
                id: idMeal,
                titulo: strMeal,
                img: strMealThumb
            });

            btnFavorito.textContent = 'Eliminar Favorito';
            mostrarToast('Agregado Correctamente');
        }

        const btnCerrarModal = document.createElement('BUTTON');
        btnCerrarModal.classList.add('btn', 'btn-secondary', 'col');
        btnCerrarModal.textContent = 'Cerrar';

        btnCerrarModal.onclick = function () {
            modal.hide();
        }

        modalFooter.appendChild(btnFavorito);
        modalFooter.appendChild(btnCerrarModal);

        /** Mostar el modal */
        modal.show();
    }

    function agregarFavorito(receta) {
        // console.log(receta);
        /** Object { id: "52874", titulo: "Beef and Mustard Pie", img: "https://www.themealdb.com/images/media/meals/sytuqu1511553755.jpg" } */
        const favoritos = JSON.parse(localStorage.getItem('favoritos')) ?? []; /** Esto va a obtener de LocalStorage y lo va a convertir a un arreglo. Si no existe, entonces lo va a asignar como un arreglo vacio. Nullish coalescing operator (??) */
        localStorage.setItem('favoritos', JSON.stringify([...favoritos, receta]));
    }

    function eliminarFavorito(id) {
        const favoritos = JSON.parse(localStorage.getItem('favoritos')) ?? [];
        const nuevosFavorito = favoritos.filter(favorito => favorito.id !== id);
        localStorage.setItem('favoritos', JSON.stringify(nuevosFavorito));
    }

    function existeStorage(id) {
        const favoritos = JSON.parse(localStorage.getItem('favoritos')) ?? [];
        /** .some() va a iterar sobre todos los elementos de un arreglo y va a retornar si al menos uno cumple con la condición. 
         * Si hay 100 elementos va a escanear cada uno de ellos y con que uno cumpla la condición este .some() va a retornar un true.
        */
        return favoritos.some(favorito => favorito.id === id);
    }

    function mostrarToast(mensaje) {
        const toastDiv = document.querySelector('#toast');
        const toastBody = document.querySelector('.toast-body');
        const toast = new bootstrap.Toast(toastDiv); //  Tienes que pasar el elemento donde quieres que se genere ese toast.
        toastBody.textContent = mensaje;

        toast.show();
    }

    function obtenerFavoritos() {
        const favoritos = JSON.parse(localStorage.getItem('favoritos')) ?? [];

        if (favoritos.length) {
            mostrarRecetas(favoritos);
            return
        }

        const noFavoritos = document.createElement('P');
        noFavoritos.textContent = 'No hay favoritos aún';
        noFavoritos.classList.add('fs-4', 'text-center', 'font-bold', 'mt-5');
        favoritosDiv.appendChild(noFavoritos);
    }

    function limpiarHTML(selector) {
        while (selector.firstChild) {
            selector.removeChild(selector.firstChild);
        }
    }

}

document.addEventListener('DOMContentLoaded', iniciarApp);