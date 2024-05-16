import rowData from "./data.json" assert { type: "json" };

const body = document.querySelector("body");
const mainAppWrapper = document.createElement("div");
const contentWrapper = document.createElement("div");

mainAppWrapper.id = "mainAppWrapper";
contentWrapper.id = "contentWrapper";

mainAppWrapper.appendChild(contentWrapper);
body.append(mainAppWrapper);

const filters = {
  searchId: null,
  searchText: "",
  limit: 10,
  page: 1,
};

const sounds = {
  vader: 1,
  yoda: 1,
};

const maxSounds = {
  vader: 5,
  yoda: 4,
};

let clickedButtonName;
let clickedButton = false;
let fullTableRecords;
let textFromKeyboard = "";
let checkedItems = {};

const createTopBar = () => {
  const topBarWrapper = document.createElement("div");
  const topBarContent = document.createElement("div");
  const message = document.createElement("span");
  const buttonsWrapper = document.createElement("div");
  const colorfulThemeButton = document.createElement("button");
  const darkThemeButton = document.createElement("button");

  topBarWrapper.className = "topBarWrapper";
  topBarContent.className = "topBarContent";
  message.innerHTML = "Write Yoda or Vader and hear their voices!";
  colorfulThemeButton.innerHTML = "Colorful theme";
  colorfulThemeButton.className = "colorfulTheme";
  darkThemeButton.innerHTML = "Dark theme";
  darkThemeButton.className = "darkTheme";

  topBarContent.append(message, buttonsWrapper);
  buttonsWrapper.append(colorfulThemeButton, darkThemeButton);
  topBarWrapper.appendChild(topBarContent);
  mainAppWrapper.prepend(topBarWrapper);

  colorfulThemeButton.addEventListener("click", () => {
    document.body.classList.remove("darkTheme");
    document.body.classList.add("colorfulTheme");
  });

  darkThemeButton.addEventListener("click", () => {
    document.body.classList.remove("colorfulTheme");
    document.body.classList.add("darkTheme");
  });
};
createTopBar();

const createButtons = () => {
  const mainButtonWrapper = document.createElement("div");

  mainButtonWrapper.className = "mainButtonWrapper";

  Object.keys(rowData).map((key) => {
    const button = document.createElement("button");
    button.classList.add("button", "collectionButton");
    button.innerHTML = key;
    mainButtonWrapper.appendChild(button);
    button.addEventListener("click", (e) => handleButtonClick(e));
  });

  contentWrapper.appendChild(mainButtonWrapper);
};
createButtons();

const handleButtonClick = (e) => {
  clickedButtonName = e.target.innerHTML;
  fullTableRecords = preparedTableData();

  document.querySelectorAll(".collectionButton").forEach((button) => {
    button.classList.remove("active");
  });
  e.target.classList.add("active");

  if (!clickedButton) {
    addSearchBar();
    addTable();
  }
  const paginationBar = document.querySelector("#paginationBar");
  if (paginationBar) {
    paginationBar.remove();
  }

  clickedButton = true;
  filters.page = 1;
  filters.searchId = null;
  filters.searchText = "";

  addPaginationBar();
  fillSearchBar();
  fillTableHead();
  fillPaginationBar();

  const filteredData = filterData();
  createTableBody(filteredData);
};

const getHeaderNames = () => {
  const patternElement = rowData[clickedButtonName][0];
  const threeFirstKeys = Object.keys(patternElement).splice(0, 3);

  const headers = ["id", ...threeFirstKeys, "created", "actions"];

  return headers;
};

const fillTableHead = () => {
  const headerNames = getHeaderNames();
  const tableHead = document.querySelector("thead");

  tableHead.innerHTML = "";

  headerNames.forEach((header) => {
    const tableHeadCell = document.createElement("th");
    tableHeadCell.innerHTML = header.replace("_", " ").toUpperCase();
    if (header === "id") {
      tableHeadCell.className = "idCell";
    }
    if (header === "actions") {
      tableHeadCell.className = "actionsCell";
    }
    tableHead.appendChild(tableHeadCell);
  });
};

const preparedTableData = () => {
  const bodyData = rowData[clickedButtonName];
  const headerNames = getHeaderNames();

  const modifiedData = bodyData.map((element, index) => {
    const modifiedRowData = {};
    headerNames.forEach((tableHeadName) => {
      if (tableHeadName === "id") {
        modifiedRowData[tableHeadName] = index + 1;
      } else if (tableHeadName === "created") {
        modifiedRowData[tableHeadName] = formatDate(element[tableHeadName]);
      } else modifiedRowData[tableHeadName] = element[tableHeadName];
    });

    return modifiedRowData;
  });
  return modifiedData;
};

const filterData = () => {
  const { searchId, searchText, limit, page } = filters;

  let filteredData = fullTableRecords;

  if (searchId) {
    filteredData = filteredData.filter((element) => element.id === searchId);
  }

  if (searchText) {
    const filteredKeyword = clickedButtonName === "films" ? "title" : "name";

    filteredData = filteredData.filter((element) =>
      element[filteredKeyword].toLowerCase().includes(searchText.toLowerCase())
    );
  }
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;
  filteredData = filteredData.slice(startIndex, endIndex);

  return filteredData;
};

const createCells = (element, row) => {
  const headerNames = getHeaderNames();

  headerNames.forEach((name) => {
    const cell = document.createElement("td");
    if (name === "actions") {
      const removeButton = document.createElement("button");
      const detailsButton = document.createElement("button");
      const checkbox = document.createElement("input");

      cell.className = "actionsCell";
      removeButton.classList = "removeButton";
      detailsButton.classList = "detailsButton";
      checkbox.type = "checkbox";
      checkbox.checked = checkedItems[element.id] || false;
      removeButton.innerHTML = `<img src="./images/trashIcon.svg" />`;
      detailsButton.innerHTML = `<img src="./images/plusIcon.svg" />`;

      removeButton.addEventListener("click", () => {
        removeRow(element.id);
      });
      detailsButton.addEventListener("click", () => {
        showDetails(element.id - 1);
      });
      checkbox.addEventListener("click", (e) => {
        handleCheckbox(e, element.id);
      });

      cell.append(removeButton, detailsButton, checkbox);
    } else {
      if (name === "id") {
        cell.className = "idCell";
      }
      cell.innerHTML = element[name];
    }
    row.appendChild(cell);
  });
};

const createTableBody = (data) => {
  const tableBody = document.querySelector("tbody");

  tableBody.innerHTML = "";

  if (data.length === 0) {
    const noDataRow = document.createElement("tr");
    const noDataCell = document.createElement("td");
    noDataCell.setAttribute("colspan", 6);
    noDataCell.classList.add("noData");
    noDataCell.innerHTML =
      "<span class='emptyArrayText'>Brak elementów do wyświetlenia</span>";
    noDataRow.appendChild(noDataCell);
    tableBody.appendChild(noDataRow);
    return;
  }

  data.forEach((element) => {
    const row = document.createElement("tr");
    tableBody.appendChild(row);
    createCells(element, row);
  });
};

const fillSearchBar = () => {
  const inputs = Array.from(document.querySelectorAll(".searchBar"));
  const numberOfElements = fullTableRecords.length;
  const [searchById, searchByText] = inputs;

  searchById.value = null;
  searchById.placeholder = !numberOfElements
    ? `0 from 0`
    : `1 from ${numberOfElements}`;
  searchById.disabled = !numberOfElements;
  searchById.min = 1;
  searchById.max = numberOfElements;
  searchByText.value = null;
  searchByText.placeholder =
    clickedButtonName === "films" ? "Search by title" : "Search by name";
  searchByText.disabled = !numberOfElements;
};

const handleSearchById = (e, searchById) => {
  const value = parseInt(e.target.value, 10);
  const maxValue = parseInt(searchById.max, 10);

  if (value <= 0 || isNaN(value)) {
    searchById.value = null;
  }
  if (maxValue < value) {
    searchById.value = filters.searchId;
    return;
  }

  filters.searchId = value;
  fillPaginationBar();

  const filteredData = filterData();

  createTableBody(filteredData);
};

const handleSearchByName = (e) => {
  filters.searchText = e.target.value;
  const filteredData = filterData();
  createTableBody(filteredData);
};

const handleLimitChange = (e) => {
  const newLimit = parseInt(e.target.value, 10);
  const firstItemIndex = (filters.page - 1) * filters.limit;

  filters.limit = newLimit;
  filters.page = Math.floor(firstItemIndex / newLimit) + 1;

  fillPaginationBar();

  const filteredData = filterData();

  createTableBody(filteredData);
};

const addPaginationBar = () => {
  const totalPages = getTotalPages();
  const paginationBar = document.createElement("div");
  const prevButton = document.createElement("button");
  const nextButton = document.createElement("button");
  const iconLeft = document.createElement("img");
  const iconRight = document.createElement("img");
  const pageInput = document.createElement("input");
  const totalPagesSpan = document.createElement("span");
  const select = document.createElement("select");

  paginationBar.id = "paginationBar";
  prevButton.className = "prev";
  nextButton.className = "next";
  pageInput.className = "paginationInput";
  totalPagesSpan.className = "totalPages";

  iconLeft.src = "./images/left.svg";
  iconRight.src = "./images/right.svg";
  pageInput.type = "number";
  totalPagesSpan.innerHTML = `z ${totalPages}`;

  [10, 20].forEach((value) => {
    const option = document.createElement("option");
    option.value = value;
    option.textContent = value;
    select.appendChild(option);
  });

  prevButton.addEventListener("click", () => handlePagination(-1));
  nextButton.addEventListener("click", () => handlePagination(1));
  pageInput.addEventListener("input", (e) => handlePageInput(e, pageInput));
  select.addEventListener("change", handleLimitChange);

  prevButton.appendChild(iconLeft);
  nextButton.appendChild(iconRight);
  paginationBar.append(
    prevButton,
    pageInput,
    totalPagesSpan,
    nextButton,
    select
  );

  contentWrapper.appendChild(paginationBar);
};

const addSearchBar = () => {
  const searchBarContainer = document.createElement("div");
  const searchBarIdWrapper = document.createElement("div");
  const searchBarTextWrapper = document.createElement("div");
  const searchByTextLabel = document.createElement("label");
  const searchByIdLabel = document.createElement("label");
  const searchByText = document.createElement("input");
  const searchById = document.createElement("input");

  searchByIdLabel.innerHTML = "Search by index";
  searchByTextLabel.innerHTML = "Search by text";
  searchById.type = "number";
  searchById.className = "searchBar";
  searchByText.className = "searchBar";
  searchBarContainer.className = "searchBarContainer";
  searchBarIdWrapper.className = "searchBarWrapper";
  searchBarTextWrapper.className = "searchBarWrapper";

  searchByText.addEventListener("input", handleSearchByName);
  searchById.addEventListener("input", (e) => handleSearchById(e, searchById));

  searchBarIdWrapper.append(searchByIdLabel, searchById);
  searchBarTextWrapper.append(searchByTextLabel, searchByText);
  searchBarContainer.append(searchBarIdWrapper, searchBarTextWrapper);
  contentWrapper.appendChild(searchBarContainer);
};

const showDetails = (rowIndex) => {
  const fullRowData = rowData[clickedButtonName][rowIndex];
  const modalContainer = document.createElement("div");
  const buttonDiv = document.createElement("div");
  const closeButton = document.createElement("button");
  const detailsTable = createDetailsTable(fullRowData);

  body.classList.add("modal-open");
  modalContainer.id = "modalContainer";
  closeButton.innerHTML = "Zamknij szczegóły";

  closeButton.addEventListener("click", () => {
    modalContainer.remove();
    body.classList.remove("modal-open");
  });

  buttonDiv.appendChild(closeButton);
  modalContainer.append(buttonDiv, detailsTable);
  contentWrapper.appendChild(modalContainer);
};

const createDetailsTable = (data) => {
  const detailsTable = document.createElement("table");
  const thead = document.createElement("thead");
  const tableBody = document.createElement("tbody");

  thead.innerHTML = "<th>KEY</th><th>VALUE</th>";

  detailsTable.append(thead, tableBody);

  Object.entries(data).forEach(([key, value]) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `<td>${key}</td><td class='detalisValueCell'>${value}</td>`;
    tableBody.appendChild(tr);
  });

  return detailsTable;
};

const addTable = () => {
  const table = document.createElement("table");
  const tableHead = document.createElement("thead");
  const tableBody = document.createElement("tbody");

  table.append(tableHead, tableBody);

  contentWrapper.appendChild(table);
};

const handlePagination = (direction) => {
  const totalPages = getTotalPages();
  const buttonLeft = document.querySelector(".prev");
  const buttonRight = document.querySelector(".next");
  const paginationInput = document.querySelector(".paginationInput");

  let { page } = filters;

  page += direction;

  if (page < 1) page = 1;
  else if (page > totalPages) page = totalPages;

  filters.page = page;

  buttonLeft.disabled = page <= 1;
  buttonRight.disabled = page >= totalPages;
  paginationInput.value = page;

  const filteredData = filterData();
  createTableBody(filteredData);
};

const getTotalPages = () => {
  const { limit } = filters;
  const totalRecords = fullTableRecords.length;
  const totalPages = Math.ceil(totalRecords / limit);
  return totalPages;
};

const fillPaginationBar = () => {
  const totalPages = getTotalPages();
  const prevButton = document.querySelector(".prev");
  const nextButton = document.querySelector(".next");
  const paginationInput = document.querySelector(".paginationInput");
  const totalPagesSpan = document.querySelector(".totalPages");
  const select = document.querySelector("select");

  select.value = filters.limit;
  select.disabled = fullTableRecords.length === 0;
  paginationInput.value = filters.page;
  paginationInput.max = totalPages;
  paginationInput.disabled = fullTableRecords.length === 0;
  totalPagesSpan.innerHTML = `z ${totalPages}`;
  nextButton.disabled = filters.page >= totalPages;
  prevButton.disabled = filters.page <= 1;
};

const formatDate = (dateString) => {
  const date = new Date(dateString);
  const year = date.getFullYear();

  let day = date.getDate();
  let month = date.getMonth() + 1;

  day = day < 10 ? `0${day}` : day;
  month = month < 10 ? `0${month}` : month;

  return `${day}-${month}-${year} `;
};

const playSound = (character) => {
  if (sounds[character] > maxSounds[character]) {
    sounds[character] = 1;
  }

  const voice = new Audio(
    `sounds/${character}/${character}${sounds[character]}.wav`
  );
  voice.play();

  textFromKeyboard = "";
  sounds[character]++;
};

const handleCheckbox = (e, id) => {
  if (checkedItems[id]) {
    delete checkedItems[id];
  } else {
    checkedItems[id] = e.target.checked;
  }

  const hasCheckedItems = Object.keys(checkedItems).length !== 0;
  const removeAllButton = document.querySelector(".removeAll");
  const table = document.querySelector("table");

  if (hasCheckedItems && !removeAllButton) {
    const removeCheckedElementsButton = document.createElement("button");

    removeCheckedElementsButton.textContent = "Remove All";
    removeCheckedElementsButton.className = "removeAll";
    removeCheckedElementsButton.addEventListener(
      "click",
      handleRemoveAllButton
    );

    table.appendChild(removeCheckedElementsButton);
  } else if (!hasCheckedItems && removeAllButton) {
    table.removeChild(removeAllButton);
  }
};

const handleRemoveAllButton = () => {
  const arrayWithCheckedId = Object.keys(checkedItems).map((element) =>
    Number(element)
  );

  fullTableRecords = fullTableRecords.filter(
    ({ id }) => !arrayWithCheckedId.includes(Number(id))
  );

  checkedItems = {};

  const totalPages = getTotalPages();

  if (filters.page > totalPages) {
    filters.page = totalPages;
  }
  removeAllButton();
  fillPaginationBar();
  fillSearchBar();

  const filteredData = filterData();
  createTableBody(filteredData);
};

const removeRow = (rowIndex) => {
  fullTableRecords = fullTableRecords.filter(
    (element) => element.id !== rowIndex
  );

  const arrayWithCheckedId = Object.keys(checkedItems).map((element) =>
    Number(element)
  );

  if (arrayWithCheckedId.includes(rowIndex)) {
    delete checkedItems[rowIndex];
    if (arrayWithCheckedId.length === 1) {
      removeAllButton();
    }
  }

  const totalPages = getTotalPages();

  if (filters.page > totalPages) {
    filters.page = totalPages;
  }

  fillPaginationBar();
  fillSearchBar();

  const filteredData = filterData();
  createTableBody(filteredData);
};

const removeAllButton = () => {
  const removeAllButton = document.querySelector(".removeAll");
  contentWrapper.removeChild(removeAllButton);
};

const handlePageInput = (e, pageInput) => {
  const value = parseInt(e.target.value, 10);
  const maxValue = parseInt(pageInput.max, 10);

  if (isNaN(value) || value <= 0 || maxValue < value) {
    pageInput.value = filters.page;
    return;
  }

  filters.page = value;

  const filteredData = filterData();

  createTableBody(filteredData);
};

window.addEventListener("keydown", (e) => {
  textFromKeyboard += e.key.toLowerCase();

  if (textFromKeyboard.includes("vader")) {
    playSound("vader");
  } else if (textFromKeyboard.includes("yoda")) {
    playSound("yoda");
  }
});
