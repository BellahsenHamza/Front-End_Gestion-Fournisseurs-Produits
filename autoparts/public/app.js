window.ready = (fn) => {
  if (document.readyState !== 'loading') {
    fn();
  } else {
    document.addEventListener('DOMContentLoaded', fn);
  }
};

window.currentMenu = null;
window.setCurrentMenu = (name) => {
  window.currentMenu = name;
};

window.buildMenu = () => {
  const selected = window.currentMenu;
  const itemsHtml = window.defs.menuItems.map((item) => `<a
    data-name="${item.name}"
    class="navbar-item ${item.name === selected ? 'is-active' : ''}">
      ${item.label}
    </a>`).join('');

  return `<nav class="navbar" role="navigation" aria-label="main navigation">
    <div class="navbar-brand">
      <a class="navbar-item" href="/">
        <img src="/images/logo.png" height="28">
      </a>
  
      <a role="button" class="navbar-burger burger" aria-label="menu" aria-expanded="false" data-target="navbarBasicExample">
        <span aria-hidden="true"></span>
        <span aria-hidden="true"></span>
        <span aria-hidden="true"></span>
      </a>
    </div>
  
    <div id="navbarBasicExample" class="navbar-menu">
      <div class="navbar-start">
        ${itemsHtml}
      </div>
    </div>
  </nav>
  `;
};

window.initMenu = () => {
  const elements = document.querySelectorAll('nav [data-name]');
  elements.forEach((element) => {
    const name = element.getAttribute('data-name');
    const menuItem = window.defs.menuItems.find((mi) => mi.name === name);
    element.addEventListener('click', () => {
      menuItem.onclick();
    });
  });
};

window.initRaw = (html) => {
  window.mainTemplate(html);
};

window.mainTemplate = (insideHtml) => {
  const node = document.getElementById('app');
  node.innerHTML = `${window.buildMenu()}${insideHtml}`;
  window.initMenu();
};

window.initList = async (name, filter = null, searchContext = null) => {
  // Étape 1
  const list = window.defs.lists.find((l) => l.name === name);
  if (!list) throw new Error(`Liste non définie: ${name}`);
  const {
    singularLabel,
    pluralLabel,
    headerTemplate,
    rowTemplate,
    searchForm,
    initSearchForm,
  } = list;

  // Étape 2
  const response = await axios.get(`http://localhost:3000/${name}`);
  let objects = response.data;
  if (filter) {
    objects = objects.filter(filter);
  }
  // Étape 3
  const html = objects.map((object) => `<tr>
    ${rowTemplate(object)}
    <td>
        <button class="action-edit button" data-id="${object.id}">Editer</button>
        <button class="button is-danger action-delete" data-id="${object.id}">
            Supprimer
        </button>
    </td>
    </tr>`).join('');

  // Étape 4
  window.mainTemplate(`<h3 class="title is-3">
      Liste des ${pluralLabel}
      <button class="button is-success action-create">
        Ajouter un ${singularLabel}
      </button>
    </h3>
    ${searchForm || ''}
    <table class="table is-fullwidth">
      <thead>
          ${headerTemplate}
      </thead>
    ${html}
    </table>`);

  if (initSearchForm) await initSearchForm(searchContext);

  // Étape 5
  document.querySelectorAll('.action-delete').forEach((button) => {
    button.addEventListener('click', async () => {
      const id = button.getAttribute('data-id');
      await axios.delete(`http://localhost:3000/${name}/${id}`);
      window.initList(name);
    });
  });

  // Étape 6
  document.querySelectorAll('.action-edit').forEach((button) => {
    button.addEventListener('click', async () => {
      const id = button.getAttribute('data-id');
      window.initForm({ name, id });
    });
  });

  // Étape 7
  const btnCreate = document.querySelectorAll('.action-create')[0];
  btnCreate.addEventListener('click', () => {
    window.initForm({ name });
  });
};

window.initForm = async ({ name, id }) => {
  const form = window.defs.forms.find((f) => f.name === name);
  if (!form) throw new Error(`Formulaire non défini: ${name}`);

  const {
    singularLabel,
    html,
    init,
    collectValues,
    initValues,
  } = form;

  const label = id ? 'Édition' : 'Ajout';

  window.mainTemplate(`<h3 class="title is-3">
      ${label} d'un ${singularLabel}
    </h3>
    ${html}
    <button class="button is-success action-do-save">
      Sauvegarder
    </button>

    <button class="button action-go-back">
      Annuler
    </button>`);
  if (init) await init();

  if (id) {
    const response = await axios.get(`http://localhost:3000/${name}/${id}`);
    initValues(response.data);
  }

  const btnSave = document.querySelectorAll('.action-do-save')[0];
  btnSave.addEventListener('click', async () => {
    const data = collectValues();
    if (!id) {
      await axios.post(`http://localhost:3000/${name}`, data);
    } else {
      await axios.put(`http://localhost:3000/${name}/${id}`, data);
    }
    await window.initList(name);
  });

  const btnGoBack = document.querySelectorAll('.action-go-back')[0];
  btnGoBack.addEventListener('click', async () => {
    await window.initList(name);
  });
};
