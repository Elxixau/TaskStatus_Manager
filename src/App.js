import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { useTable, useGlobalFilter, useSortBy } from 'react-table';
import swal from 'sweetalert';
import { PencilIcon as PencilSquareIcon, TrashIcon, PlusIcon, SearchIcon, FilterIcon } from '@heroicons/react/outline';

const categoryStyles = {
  'Aplikasi Web': 'bg-pink-800 text-white',
  'Company Profile': 'bg-indigo-800 text-white',
  'Web Statis': 'bg-yellow-800 text-white',
  'Undangan Digital': 'bg-red-800 text-white',
  'Landing Page': 'bg-purple-800 text-white',
};

const statusStyles = {
  'Done / Sudah Lunas': 'bg-green-500 text-white',
  'In progress / Sudah dp': 'bg-yellow-500 text-white',
  'Coming soon': 'bg-amber-600 text-white',
};

const paymentStyles = {
  'Transfer | BRI': 'bg-blue-500 text-white',
  'Transfer | Dana': 'bg-indigo-500 text-white',
  '-': 'bg-yellow-500 text-white',
};

const ProjectTable = () => {
  const [data, setData] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [editableRow, setEditableRow] = useState(null);
  const [editValues, setEditValues] = useState({});
  const [newProject, setNewProject] = useState({
    id: '', // Ini harus ada di state tetapi tidak perlu diinputkan di form
    name: '',
    category: 'Aplikasi Web',
    konsep: '',
    status: 'Coming soon',
    payment: '-',
    nominal: '',
  });
  const [isEditing, setIsEditing] = useState(false);

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setNewProject((prevProject) => ({
      ...prevProject,
      [name]: value,
    }));
  };

  const handleEditClick = (project) => {
    setEditableRow(project.id);
    setNewProject({
      ...project,
    });
    setIsEditing(true);
  };

  const handleInputChange = (e, fieldName) => {
    const { value } = e.target;
    setNewProject((prevValues) => ({
      ...prevValues,
      [fieldName]: value,
    }));
  };

  useEffect(() => {
    fetchProjects();
  }, [searchQuery, selectedStatus]);

  const fetchProjects = () => {
    axios.get('https://script.google.com/macros/s/AKfycbyzuoXRqckLOAYwlfbweX6xz53xz04Nic7H-3lwJJz8Khsar9rvuKbY1oIZfjtpluF7/exec')
      .then(response => {
        let filteredData = response.data;
        if (searchQuery) {
          filteredData = filteredData.filter(project =>
            project.name.toLowerCase().includes(searchQuery.toLowerCase())
          );
        }
        if (selectedStatus) {
          filteredData = filteredData.filter(project =>
            project.status === selectedStatus
          );
        }
        setData(filteredData);
      })
      .catch(error => console.error('Error fetching data:', error));
  };

  
const handleSaveEdit = () => {
  fetch(`https://sheetdb.io/api/v1/m7wo9kpn6ev2h/id/${encodeURIComponent(newProject.id)}`, {
    method: "PATCH",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      data: newProject,
    }),
  })
    .then((response) => response.json())
    .then((data) => {
      console.log(data);
      // Show success alert
      swal({
        title: 'Success!',
        text: 'The project has been successfully updated!',
        icon: 'success',
        button: 'OK',
      }).then(() => {
        // Reset form fields and state after successful update
        setIsEditing(false);
        setNewProject({
          id: '',
          name: '',
          category: 'Aplikasi Web',
          konsep: '',
          status: 'Coming soon',
          payment: '-',
          nominal: '',
        });
        fetchProjects(); // Refresh the table data
      });
    })
    .catch((error) => {
      console.error("Error:", error);
      // Show error alert
      swal({
        title: 'Error!',
        text: 'There was a problem updating the project. Please try again.',
        icon: 'error',
        button: 'OK',
      });
    });
};
  const handleDelete = (id) => {
    swal({
      title: 'Are you sure?',
      text: 'Once deleted, you will not be able to recover this project!',
      icon: 'warning',
      buttons: true,
      dangerMode: true,
    }).then((willDelete) => {
      if (willDelete) {
        fetch(`https://sheetdb.io/api/v1/m7wo9kpn6ev2h/id/${encodeURIComponent(id)}`, {
          method: "DELETE",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
        })
          .then((response) => response.json())
          .then((data) => {
            console.log('Deletion successful:', data);
            fetchProjects(); // Refresh the table data
          })
          .catch((error) => {
            console.error('Error deleting record:', error);
            swal('Error!', 'There was a problem deleting the project. Please try again.', 'error');
          });
      }
    });
  };

  const generateUniqueId = () => {
    return Date.now() + Math.floor(Math.random() * 1000);
  };

  const handleAddProject = (e) => {
    e.preventDefault(); // Prevent default form submission behavior

    if (isEditing) {
      handleSaveEdit();
    } else {
      const uniqueId = generateUniqueId(); // Generate a unique ID for the new project

      const formData = new FormData();
      Object.keys(newProject).forEach((key) => {
        formData.append(key, newProject[key]);
      });
      formData.append('id', uniqueId); // Add the unique ID to the form data
      formData.append('waktu_input', new Date().toLocaleString());

      axios.post(
        "https://sheetdb.io/api/v1/m7wo9kpn6ev2h",
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      )
      .then((response) => {
        console.log(response.data);
        setNewProject({
          name: '',
          category: 'Aplikasi Web',
          konsep: '',
          status: 'Coming soon',
          payment: 'Transfer | BRI',
          nominal: '',
        });
        // Show success alert
        swal({
          title: 'Success!',
          text: 'The project has been successfully added!',
          icon: 'success',
          button: 'OK',
        });
        fetchProjects(); // Refresh the table data
      })
      .catch((error) => {
        console.log(error);
        // Show error alert
        swal({
          title: 'Error!',
          text: 'There was a problem adding the project. Please try again.',
          icon: 'error',
          button: 'OK',
        });
      });
    }
  };

  const columns = useMemo(
    () => [
      { Header: 'ID', accessor: 'id'},
      { 
        Header: 'Name', 
        accessor: 'name'
      },
      { 
        Header: 'Category', 
        accessor: 'category'
      },
      { 
        Header: 'Konsep', 
        accessor: 'konsep'
      },
      { 
        Header: 'Status', 
        accessor: 'status'
      },
      { 
        Header: 'Payment', 
        accessor: 'payment'
      },
      { 
        Header: 'Nominal', 
        accessor: 'nominal'
      },
      {
        Header: 'Actions',
        Cell: ({ row }) => (
          <div className="flex space-x-2">
            <button
              onClick={() => handleEditClick(row.original)}
              className="text-blue-600 hover:text-blue-800"
            >
              <PencilSquareIcon className="w-5 h-5" />
            </button>
            <button
              onClick={() => handleDelete(row.original.id)}
              className="text-red-600 hover:text-red-800"
            >
              <TrashIcon className="w-5 h-5" />
            </button>
          </div>
        ),
      },
    ],
    [isEditing]
  );

  const tableInstance = useTable(
    { columns, data },
    useGlobalFilter,
    useSortBy
  );

  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    rows,
    prepareRow,
  } = tableInstance;

  return (
    <div className="p-6 bg-gray-900 text-white min-h-screen">
      <div className="mx-auto flex flex-col gap-8 p-4">
        <div className="bg-gray-800 p-4 rounded-lg shadow-md mb-8"> 
           {/* Display Project ID */}
  {newProject.id && (
    <div className="bg-yellow-200 col-span-2 mb-4 p-2 rounded">
      <p className=" text-orange-900">Update Record [ID: {newProject.id}]</p>
    </div>
  )}
          <h2 className="text-xl font-semibold mb-4">Add New Project</h2>
          <form className="grid grid-cols-2 gap-4" onSubmit={handleAddProject}>
            <div className="col-span-2">
              <input
                type="text"
                name="name"
                value={newProject.name}
                onChange={handleFormChange}
                placeholder="Project Name"
                className="w-full p-2 rounded bg-gray-700 text-gray-300 placeholder-gray-500"
              />
            </div>
            <div className="col-span-2">
              <input
                type="text"
                name="konsep"
                value={newProject.konsep}
                onChange={handleFormChange}
                placeholder="Konsep Project"
                className="w-full p-2 rounded bg-gray-700 text-gray-300 placeholder-gray-500"
              />
            </div>
            <div>
              <select
                name="category"
                value={newProject.category}
                onChange={handleFormChange}
                className="w-full p-2 rounded bg-gray-700 text-gray-300"
              >
                <option value="Aplikasi Web">Aplikasi Web</option>
                <option value="Company Profile">Company Profile</option>
                <option value="Web Statis">Web Statis</option>
                <option value="Undangan Digital">Undangan Digital</option>
                <option value="Landing Page">Landing Page</option>
              </select>
            </div>
            <div>
              <select
                name="status"
                value={newProject.status}
                onChange={handleFormChange}
                className="w-full p-2 rounded bg-gray-700 text-gray-300"
              >
                <option value="Coming soon">Coming soon</option>
                <option value="In progress / Sudah dp">In progress / Sudah dp</option>
                <option value="Done / Sudah Lunas">Done / Sudah Lunas</option>
              </select>
            </div>
            <div>
              <select
                name="payment"
                value={newProject.payment}
                onChange={handleFormChange}
                className="w-full p-2 rounded bg-gray-700 text-gray-300"
              >
                <option value="Transfer | BRI">Transfer | BRI</option>
                <option value="Transfer | Dana">Transfer | Dana</option>
                <option value="-">-</option>
              </select>
            </div>
            <div>
              <input
                type="text"
                name="nominal"
                value={newProject.nominal}
                onChange={handleFormChange}
                placeholder="Nominal"
                className="w-full p-2 rounded bg-gray-700 text-gray-300 placeholder-gray-500"
              />
            </div>
            <div className="col-span-2">
              <button
                type="submit"
                className="w-full p-2 rounded bg-green-600 text-white"
              >
                <PlusIcon className="w-5 h-5 inline-block mr-2" />
                {isEditing ? 'Update Project' : 'Add Project'}
              </button>
            </div>
          </form>
        </div>

        {/* Project List Table */}
        <div className="flex-grow bg-gray-800 p-4 rounded-lg shadow-md">
          <div className="flex items-center justify-between mb-8">
            <h1 className='text-2xl font-semibold'>List Pemesanan Web</h1>
            <div className="flex gap-4">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2 rounded bg-gray-700 text-gray-300 placeholder-gray-500"
                />
                <SearchIcon className="absolute left-2 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              </div>
              <div className="relative">
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="py-2 px-4 rounded bg-gray-700 text-gray-300"
                >
                  <option value="">All Status</option>
                  <option value="Done / Sudah Lunas">Done / Sudah Lunas</option>
                  <option value="In progress / Sudah dp">In progress / Sudah dp</option>
                  <option value="Coming soon">Coming soon</option>
                </select>
                <FilterIcon className="absolute right-2 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              </div>
            </div>
          </div>
          <div className="relative overflow-x-auto shadow-md sm:rounded-lg">
            <table {...getTableProps()} className="w-full text-sm text-left rtl:text-right text-gray-300 bg-gray-900">
              <thead className="text-xs text-gray-500 uppercase bg-gray-800">
                {headerGroups.map(headerGroup => (
                  <tr {...headerGroup.getHeaderGroupProps()}>
                    {headerGroup.headers.map(column => (
                      <th
                        {...column.getHeaderProps(column.getSortByToggleProps())}
                        className="px-6 py-3"
                      >
                        {column.render('Header')}
                        <span>
                          {column.isSorted
                            ? column.isSortedDesc
                              ? ' 🔽'
                              : ' 🔼'
                            : ''}
                        </span>
                      </th>
                    ))}
                  </tr>
                ))}
              </thead>
              <tbody {...getTableBodyProps()} className="bg-gray-800">
                {rows.map(row => {
                  prepareRow(row);
                  return (
                    <tr {...row.getRowProps()} className="bg-gray-900 border-b hover:bg-gray-700">
                      {row.cells.map(cell => (
                        <td {...cell.getCellProps()} className="px-6 py-4">
                          {cell.column.id === 'category' ? (
                            <span className={`p-2 rounded ${categoryStyles[cell.value]}`}>
                              {cell.render('Cell')}
                            </span>
                          ) : cell.column.id === 'status' ? (
                            <span className={`p-2 rounded ${statusStyles[cell.value]}`}>
                              {cell.render('Cell')}
                            </span>
                          ) :  cell.column.id === 'payment' ? (
                            <span className={`p-2 rounded ${paymentStyles[cell.value]}`}>
                              {cell.render('Cell')}
                            </span>
                          ) : cell.column.id === 'nominal' ? (
                            <span className={`p-2 rounded ${paymentStyles[cell.value]}`}>
                             Rp. {cell.render('Cell')}
                            </span>
                          ) : (
                            cell.render('Cell')
                          )}
                        </td>
                      ))}
                    
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectTable;
