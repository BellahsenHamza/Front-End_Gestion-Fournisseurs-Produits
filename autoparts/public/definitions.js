window.defs = {
  menuItems: [
    {
      name: 'suppliers',
      label: 'Fournisseurs',
      onclick() {
        window.setCurrentMenu('suppliers');
        window.initList('suppliers');
      },
    },
    {
      name: 'products',
      label: 'Produits',
      onclick() {
        window.setCurrentMenu('products');
        window.initList('products');
      },
    },
  ],

  lists: [
    {
      name: 'suppliers',
      pluralLabel: 'fournisseurs',
      singularLabel: 'fournisseur',
      headerTemplate: `
        <tr>
          <th>Nom du fournisseur</th>
          <th>Contact</th>
          <th>Téléphone</th>
          <th>Ville</th>
          <th>Actions</th>
        </tr>`,
      rowTemplate(supplier) {
        return `
          <td>${supplier.name}</td>
          <td>${supplier.contact}</td>
          <td>${supplier.telephone}</td>
          <td>${supplier.city}</td>`;
      },
    },
    {
      name: 'products',
      pluralLabel: 'produits',
      singularLabel: 'produit',
      headerTemplate: `
        <tr>
          <th>Titre du produit</th>
          <th>Numéro du modèle</th>
          <th>Code</th>
          <th>Prix unitaire</th>
          <th>Inventaire</th>
          <th>Actions</th>
        </tr>`,
      rowTemplate(product) {
        let classes;
        if (product.inventory <= 5) {
          classes = 'class="lowInventory"';
        } else {
          classes = '';
        }
        return `
          <td ${classes}>${product.title}</td>
          <td ${classes}>${product.modelNo}</td>
          <td ${classes}>${product.code}</td>
          <td ${classes}>${product.unitPrice} $</td>
          <td ${classes}>${product.inventory}</td>`;
      },
      searchForm: `<div class="searchForm">
      <input class="input" name="search" />
      <button class="button is-info action-search">Rechercher</button>
      <button class="button action-cancel-search">Annuler la recherche</button>
      </div>`,
      initSearchForm(searchContext) {
        const searchBtn = document.querySelector('.action-search');
        const inputSearch = document.querySelector('[name="search"]');
        inputSearch.value = searchContext;
        searchBtn.addEventListener('click', () => {
          const valueSearch = document.querySelector('[name="search"]').value;
          window.initList('products', (produit) => produit.code === valueSearch, valueSearch);
        });
        const cancelSearchBtn = document.querySelector('.action-cancel-search');
        cancelSearchBtn.style.display = searchContext === null ? 'none' : '';
        cancelSearchBtn.addEventListener('click', () => {
          window.initList('products', null, null);
        });
      },
    },
  ],

  forms: [
    {
      name: 'suppliers',
      singularLabel: 'fournisseur',
      html: `<div class="field">
            <label class="label">Nom du fournisseur</label>
            <div class="control">
                <input name="name" class="input" type="text" placeholder="Entrez le nom du fournisseur">
            </div>
        </div>

        <div class="field">
            <label class="label">Nom du contact</label>
            <div class="control">
                <input name="contact" class="input" type="text" placeholder="Entrez le nom du contact">
            </div>
        </div>

        <div class="field">
            <label class="label">Numéro de téléphone</label>
            <div class="control">
                <input name="telephone" class="input" type="text" placeholder="Entrez le numéro de téléphone">
            </div>
        </div>`,
      collectValues() {
        const name = document.querySelectorAll('input[name="name"]')[0].value;
        const contact = document.querySelectorAll('input[name="contact"]')[0].value;
        const telephone = document.querySelectorAll('input[name="telephone"]')[0].value;
        return { name, contact, telephone };
      },
      initValues(supplier) {
        const nameElement = document.querySelectorAll('input[name="name"]')[0];
        nameElement.value = supplier.name;
        const contactElement = document.querySelectorAll('input[name="contact"]')[0];
        contactElement.value = supplier.contact;
        const telephoneElement = document.querySelectorAll('input[name="telephone"]')[0];
        telephoneElement.value = supplier.telephone;
      },
    },
    {
      name: 'products',
      singularLabel: 'produit',
      html: `<div class="field">
            <label class="label">Titre du produit</label>
            <div class="control">
                <input name="title" class="input" type="text" placeholder="Entrez le titre du produit">
            </div>
        </div>
        <div class="field">
        <label class="label">Modèle</label>
        <div class="control">
            <input name="modelNo" class="input" type="text" placeholder="Entrez le numéro du modèle">
        </div>
    </div> 
    <div class="field">
            <label class="label">Code du produit</label>
            <div class="control">
                <input name="code" class="input" type="text" placeholder="Entrez le code du produit">
            </div>
        </div>
        <div class="field">
            <label class="label">Prix unitaire</label>
            <div class="control">
                <input name="unitPrice" class="input" type="text" placeholder="Entrez le prix unitaire du produit">
            </div>
        </div>
        <div class="field">
            <label class="label">Quantité en inventaire</label>
            <div class="control">
                <input name="inventory" class="input" type="text" placeholder="Entrez la quantité">
            </div>
        </div>
        <div class="field">
            <label class="label">Fournisseur</label>
            <div class="control select">
              <select name="supplier">
              </select>
            </div>
        </div>`,
      async init() {
        const response = await axios.get('http://localhost:3000/suppliers');
        const suppliers = response.data;
        const htmlSelect = suppliers.map((supplier) => `<option value=${supplier.id}>${supplier.name}</option>`);
        const selectElement = document.querySelectorAll('select[name="supplier"]')[0];
        selectElement.innerHTML = `<option></option>${htmlSelect}`;
      },
      collectValues() {
        const title = document.querySelectorAll('input[name="title"]')[0].value;
        const modelNo = document.querySelectorAll('input[name="modelNo"]')[0].value;
        const code = document.querySelectorAll('input[name="code"]')[0].value;
        const unitPrice = document.querySelectorAll('input[name="unitPrice"]')[0].value;
        const inventory = document.querySelectorAll('input[name="inventory"]')[0].value;
        const supplierId = document.querySelectorAll('select[name="supplier"]')[0].value;
        return {
          title, modelNo, code, unitPrice, inventory, supplierId: Number(supplierId),
        };
      },
      async initValues(product) {
        const titleElement = document.querySelectorAll('input[name="title"]')[0];
        titleElement.value = product.title;
        const modelNoElement = document.querySelectorAll('input[name="modelNo"]')[0];
        modelNoElement.value = product.modelNo;
        const codeElement = document.querySelectorAll('input[name="code"]')[0];
        codeElement.value = product.code;
        const unitPriceElement = document.querySelectorAll('input[name="unitPrice"]')[0];
        unitPriceElement.value = product.unitPrice;
        const inventoryElement = document.querySelectorAll('input[name="inventory"]')[0];
        inventoryElement.value = product.inventory;
        const selectElement = document.querySelectorAll('select[name="supplier"]')[0];
        selectElement.value = product.supplierId;
      },
    },
  ],
};
