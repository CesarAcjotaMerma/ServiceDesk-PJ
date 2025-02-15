import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  Button,
  useColorModeValue,
  Text,
  HStack,
  Badge,
  IconButton,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  FormControl,
  FormLabel,
  ModalFooter,
  SimpleGrid,
  chakra,
  Flex,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Popover,
  PopoverTrigger,
  Portal,
  PopoverContent,
  PopoverArrow,
  PopoverHeader,
  PopoverCloseButton,
  PopoverBody,
  Stack,
  Avatar,
  Tooltip,
  Input,
} from '@chakra-ui/react';

import { store } from '../../../../store/store';

import DataTable, { createTheme } from 'react-data-table-component';
import DataTableExtensions from 'react-data-table-component-extensions';
import 'react-data-table-component-extensions/dist/index.css';

import Moment from 'moment';
import Select from 'react-select';

import IncidenciaDetalles from '../IncidenciaDetalles';
import { fetchIncidenciasAsignadas, reAsignarIncidencia } from '../../../../actions/incidencia';
import { RiUserShared2Line } from 'react-icons/ri';
import { FaFilter, FaHistory } from 'react-icons/fa';
import { AiFillFilter, AiOutlineFileSearch } from 'react-icons/ai';
import { RepeatIcon, SearchIcon } from '@chakra-ui/icons';
import { getIncidenciaAsignadas } from './incidencia';
import { customStyles } from '../../../../helpers/customStyle';
import { SpinnerComponent } from '../../../../helpers/spinner';
// import { SpinnerComponent } from '../../../../helpers/spinner';

export default function TableIncidenciaAsignados() {
  const dispatch = useDispatch();
  const { identificador } = useSelector(state => state.auth);

  const data = store.getState().incidenciasAsignadas.rows;
  const dataSede = store.getState().sede.rows;

  const [tableRowsData, setTableRowsData] = useState(data);
  const [tableRowsDataSede, setTableRowsDataSede] = useState([]);
  const [fechaDesdeValue, setFechaDesdeValue] = useState(null);
  const [fechaHastaValue, setFechaHastaValue] = useState(null);

  let bg = useColorModeValue('white', 'gray.900');
  let theme = useColorModeValue('default', 'solarized');
  let fechaDesde = Moment().startOf('month').format('yyyy-MM-DD');
  let fechaHasta = Moment(new Date()).format('yyyy-MM-DD');

  // ✅ Get Min date
  const minDate = new Date(
    Math.min(
      ...tableRowsData.map(element => {
        return new Date(element.fecha);
      }
      ),
    ),
  );

  let fechaMinima = Moment(minDate).format('yyyy-MM-DD');

  const dataForm = {
    startDate: fechaDesdeValue === null ? fechaDesde : fechaDesdeValue,
    endDate: fechaHastaValue === null ? fechaHasta : fechaHastaValue,
  }

  const fetchDataIncidenciasAsignadas = async () => {
    const response = await fetchIncidenciasAsignadas(dataForm);
    dispatch(getIncidenciaAsignadas(response));
  }

  useEffect(() => {
    if (store.getState().incidenciasAsignadas.checking) {
      fetchDataIncidenciasAsignadas();
    }
  })

  const handleSearchDataIncidenciasAsignadas = () => {
    fetchDataIncidenciasAsignadas();
  }

  //Contadores de incidencia
  const ContadorPendientes = tableRowsData.filter(row => row.historialIncidencia.filter(pendiente => pendiente.estadoIncidencia === "P" && pendiente.estado === "A").length > 0);
  const ContadorTramite = tableRowsData.filter(row => row.historialIncidencia.filter(tramite => tramite.estadoIncidencia === "T" && tramite.estado === "A").length > 0);
  const ContadorAtendidas = tableRowsData.filter(row => row.historialIncidencia.filter(atendida => atendida.estadoIncidencia === "A" && atendida.estado === "A").length > 0);

  // filtros por estado

  const handleClickFilterPendientes = async () => {
    const dataFilter = data.filter(row => row.historialIncidencia.filter(pendiente => pendiente.estadoIncidencia === "P" && pendiente.estado === "A").length > 0);
    setTableRowsData(dataFilter);
  }

  const handleClickFilterTramite = async () => {
    const dataFilter = data.filter(row => row.historialIncidencia.filter(pendiente => pendiente.estadoIncidencia === "T" && pendiente.estado === "A").length > 0);
    setTableRowsData(dataFilter);
  }

  const handleClickFilterAtendidas = async () => {
    const dataFilter = data.filter(row => row.historialIncidencia.filter(pendiente => pendiente.estadoIncidencia === "A" && pendiente.estado === "A").length > 0);
    setTableRowsData(dataFilter);
  }

  const handleClickFilterTodos = async () => {
    const dataFilter = data.filter(row => row.historialIncidencia.filter(pendiente => pendiente.estado === "A").length > 0);
    setTableRowsData(dataFilter);
  }

  const handleSelectSede = (value) => {
    if (value !== null) {
      setTableRowsDataSede(value.map(item => item.value));
    } else {
      return 'SELECCIONE UNA SEDE';
    }
  }

  /**
   * Function to filter data by sede
   */

  const handleClickFilterBySede = () => {
    const dataFilter = tableRowsData.filter(row => tableRowsDataSede.includes(row?.oficina?.organo?.sede?.idSede));
    setTableRowsData(dataFilter);
  }

  const refreshTable = () => {
    fetchDataIncidenciasAsignadas();
  }

  const columns = [
    {
      name: 'USUARIO',
      selector: row => row.persona.nombre + ' ' + row.persona.apellido,
      cellExport: row => row.persona.nombre + ' ' + row.persona.apellido,
      sortable: true,
      wrap: true,
    },
    {
      name: 'MOTIVO',
      selector: row => row.motivo.motivo,
      cellExport: row => row.motivo.motivo,
      sortable: true,
    },
    {
      name: 'FECHA Y HORA',
      selector: row => Moment(row.fecha).format("yyyy-MM-DD - HH:mm:ss"),
      cellExport: row => Moment(row.fecha).format("yyyy-MM-DD - HH:mm:ss"),
      sortable: true,
    },
    {
      name: 'TÉCNICO ASIGNADO',
      wrap: true,
      sortable: true,
      selector: row => {
        var historial = row.historialIncidencia.filter(p => p.estado === 'A');
        return (
          historial[0]?.persona_asignado.nombre + ' ' + historial[0]?.persona_asignado.apellido
        )
      },
      cellExport: row => {
        var historial = row.historialIncidencia.filter(p => p.estado === 'A');
        return (
          historial[0]?.persona_asignado.nombre + ' ' + historial[0]?.persona_asignado.apellido
        )
      }
    },
    {
      name: 'IP',
      sortable: true,
      selector: row => {
        var historial = row.historialIncidencia.filter(p => p.estado === 'A');
        return (historial[0]?.ip)
      },
      cellExport: row => {
        var historial = row.historialIncidencia.filter(p => p.estado === 'A');
        return (historial[0]?.ip)
      },
    },
    {
      name: 'ESTADO',
      selector: row => row.historialIncidencia.map(row => row.estado === 'A' ? row.estado : ''),
      sortable: true,
      center: true,
      cell: row => {
        var historial = row.historialIncidencia.filter(p => p.estado === 'A');
        return (
          <Badge
            bg={historial[0].estadoIncidencia === 'P' ? 'red.500' : historial[0].estadoIncidencia === 'T' ? 'yellow.500' : 'green.500'}
            color={'white'}
            py="4px"
            w={"100px"}
            textAlign={'center'}
            borderRadius={'md'}
            fontSize={'12px'}
          >
            {historial[0].estadoIncidencia === 'P' ? 'PENDIENTE' : historial[0].estadoIncidencia === 'T' ? 'EN TRÁMITE' : 'ATENDIDO'}
          </Badge>
        )
      },
      cellExport: row => {
        var historial = row.historialIncidencia.filter(p => p.estado === 'A');
        return (
          historial[0].estadoIncidencia === 'P' ? 'PENDIENTE' : historial[0].estadoIncidencia === 'T' ? 'EN TRÁMITE' : 'ATENDIDO'
        )
      },
    },
    {
      name: 'ACCIONES',
      sortable: false,
      cell: row => {
        let historial = row.historialIncidencia.filter(p => p.estado === 'A');
        let historialTecnico = row.historialIncidencia.filter(e => e.estado === 'N' && e.persona_asignado !== null).slice(-3).reverse();
        return (
          <div>
            <IncidenciaDetalles
              rowId={row.idIncidencia}
              identificador={identificador}
            />
            {historial[0].estadoIncidencia !== 'A' && historial[0].estadoIncidencia !== 'T' ? (
              <ModalReAsignarTecnico
                row={row}
                refreshTable={refreshTable}
                dataForm={dataForm}
              />
            ) : null}
            {historialTecnico.length > 0 && historial[0].estadoIncidencia !== 'A' ? (
              <Popover placement='right'>
                <PopoverTrigger>
                  <IconButton
                    icon={<FaHistory size={'20px'} />}
                    variant={'solid'}
                    colorScheme={'orange'}
                    ml={1}
                    size={'sm'}
                  />
                </PopoverTrigger>
                <Portal>
                  <PopoverContent >
                    <PopoverArrow />
                    <PopoverHeader bg="gray.700" color="white" borderTopRadius="md">
                      <Text fontSize={'12px'} textAlign='center' fontWeight={'semibold'}>ÚLTIMOS DE TÉCNICOS ASIGNADOS</Text>
                    </PopoverHeader>
                    <PopoverCloseButton color="white" />
                    <PopoverBody>
                      <Stack direction={'column'} spacing={2}>
                        {historialTecnico.map((row, index) => (
                          <Stack direction={['column', 'row']} textAlign={['center', 'justify']} key={index} alignItems='baseline' w='full' spacing={1}>
                            <Avatar size={'xs'} name={row.persona_asignado?.nombre + ' ' + row.persona_asignado?.apellido} />
                            <HStack justifyContent='space-between' w={'full'}>
                              <Text fontSize={'9px'}>{row.persona_asignado?.nombre + ' ' + row.persona_asignado?.apellido}</Text>
                              <Text fontSize={'9px'}>{Moment(row.fecha).format("DD/MM/YY - HH:mm:ss").trimEnd()}</Text>
                            </HStack>
                          </Stack>
                        ))}
                      </Stack>
                    </PopoverBody>
                  </PopoverContent>
                </Portal>
              </Popover>
            ) : null}
          </div>
        );
      },
      export: false,
      width: '150px',
    },
  ];

  // CREANDO UN TEMA PARA LA TABLA

  createTheme('solarized', {
    text: {
      primary: '#FFF',
      secondary: '#FFF',
    },
    background: {
      default: '#171923',
    },
    context: {
      background: '#171923',
      text: '#FFF',
    },
    divider: {
      default: '#FFF opacity 92%',
    },
  });

  if (store.getState().incidenciasAsignadas.checking === true) {
    return (
      <SpinnerComponent />
    )
  } else {
    return (
      <>
        <Box borderWidth="1px"
          borderRadius="lg"
          overflow="hidden"
          boxShadow={'md'}
          mb={4}
          p={2}
          fontSize={['6px', '9px', '10px', '12px']}
          bg={bg} >
          <SimpleGrid columns={4} spacing={5} textColor={'white'}>
            <Box
              w={'100%'}
              bg="white"
              _dark={{ bg: "gray.800", borderWidth: "1px" }}
              shadow="lg"
              rounded="lg"
              overflow="hidden"
              textAlign={'center'}
            >
              <chakra.h3
                py={2}
                textAlign="center"
                fontWeight="bold"
                textTransform="uppercase"
                color="red.500"
                _dark={{ color: "white" }}
              >
                INCIDENCIAS PENDIENTES
              </chakra.h3>
              <Flex
                alignItems="center"
                justify={'center'}
                py={2}
                w={'100%'}
                bg="red.500"
                _dark={{ bg: "gray.700" }}
              >
                <chakra.span
                  fontWeight="bold"
                  color="white"
                  _dark={{ color: "gray.200" }}
                >
                  {ContadorPendientes.length}
                </chakra.span>
              </Flex>
            </Box>
            <Box
              w={'100%'}
              bg="white"
              _dark={{ bg: "gray.800", borderWidth: "1px" }}
              shadow="lg"
              rounded="lg"
              overflow="hidden"
              textAlign={'center'}
            >
              <chakra.h3
                py={2}
                textAlign="center"
                fontWeight="bold"
                textTransform="uppercase"
                color="yellow.500"
                _dark={{ color: "white" }}
              >
                Incidencias en Tramite
              </chakra.h3>
              <Flex
                alignItems="center"
                justify={'center'}
                py={2}
                px={3}
                bg="yellow.500"
                _dark={{ bg: "gray.700" }}
              >
                <chakra.span
                  fontWeight="bold"
                  color="gray.200"
                  _dark={{ color: "gray.200" }}
                >
                  {ContadorTramite.length}
                </chakra.span>
              </Flex>
            </Box>
            <Box
              w={'100%'}
              bg="white"
              _dark={{ bg: "gray.800", borderWidth: "1px" }}
              shadow="lg"
              rounded="lg"
              overflow="hidden"
              textAlign={'center'}
            >
              <chakra.h3
                py={2}
                textAlign="center"
                fontWeight="bold"
                textTransform="uppercase"
                color="green.500"
                _dark={{ color: "white" }}
              >
                INCIDENCIAS ATENDIDAS
              </chakra.h3>
              <Flex
                alignItems="center"
                justify={'center'}
                py={2}
                px={3}
                bg="green.500"
                _dark={{ bg: "gray.700" }}
              >
                <chakra.span
                  fontWeight="bold"
                  color="white"
                  _dark={{ color: "gray.200" }}
                >
                  {ContadorAtendidas.length}
                </chakra.span>
              </Flex>
            </Box>
            <Box
              w={'100%'}
              bg="white"
              _dark={{ bg: "gray.800", borderWidth: "1px" }}
              shadow="lg"
              rounded="lg"
              overflow="hidden"
              textAlign={'center'}
            >
              <chakra.h3
                py={2}
                textAlign="center"
                fontWeight="bold"
                textTransform="uppercase"
                color="gray.600"
                _dark={{ color: "white" }}
              >
                TOTAL DE INCIDENCIAS
              </chakra.h3>
              <Flex
                alignItems="center"
                justify={'center'}
                py={2}
                px={3}
                bg="gray.600"
                _dark={{ bg: "gray.700" }}
              >
                <chakra.span
                  fontWeight="bold"
                  color="white"
                  _dark={{ color: "gray.200" }}
                >
                  {tableRowsData.length}
                </chakra.span>
              </Flex>
            </Box>
          </SimpleGrid>
        </Box>
        <Box
          borderWidth="1px"
          borderRadius="lg"
          overflow="hidden"
          boxShadow={'md'}
          bg={bg}
          paddingBottom={4}
        >
          <HStack
            width={'100%'}
            justifyContent={'space-between'}
            pt={4}
            px={4}
          >
            <Box>
              <Text fontSize="lg" fontWeight="600">
                INCIDENCIAS ASIGNADAS
              </Text>
              <Stack direction="row" spacing={2} mt={4} alignItems={'baseline'}>
                <Text fontSize="sm" fontWeight="600">
                  DESDE
                </Text>
                <Input
                  type={'date'}
                  defaultValue={fechaMinima <= fechaDesde ? fechaMinima : fechaDesde}
                  onChange={(e) => setFechaDesdeValue(e.target.value)}
                />

                <Text fontSize="sm" fontWeight="600">
                  HASTA
                </Text>
                <Input
                  type={'date'}
                  defaultValue={fechaHasta}
                  onChange={(e) => setFechaHastaValue(e.target.value)}
                />
                <IconButton
                  aria-label="Search database"
                  icon={<SearchIcon />}
                  size="md"
                  colorScheme="teal"
                  onClick={handleSearchDataIncidenciasAsignadas}
                />
              </Stack>
            </Box>
            <Box>
              <Stack direction={'row'} spacing={1} justifyContent="space-between">
                <IconButton
                  size={'sm'} mr={2}
                  icon={<RepeatIcon boxSize={4} />}
                  colorScheme={'facebook'}
                  onClick={refreshTable} />
                <Menu size={'xs'}>
                  <MenuButton as={'menu'} style={{ cursor: 'pointer' }}>
                    <HStack spacing={2}>
                      <Text fontSize="sm" fontWeight={'semibold'}>
                        FILTRAR POR ESTADO
                      </Text>
                      <IconButton colorScheme={'twitter'} icon={<FaFilter />} size="sm" />
                    </HStack>
                  </MenuButton>
                  <MenuList zIndex={2} fontSize="sm">
                    <MenuItem onClick={handleClickFilterPendientes} icon={<AiFillFilter color='red' size={'20px'} />}>PENDIENTES</MenuItem>
                    <MenuItem onClick={handleClickFilterTramite} icon={<AiFillFilter color='#d69e2e' size={'20px'} />}>EN TRAMITE</MenuItem>
                    <MenuItem onClick={handleClickFilterAtendidas} icon={<AiFillFilter color='green' size={'20px'} />}>ATENDIDAS</MenuItem>
                    <MenuItem icon={<AiFillFilter size={'20px'} />} onClick={handleClickFilterTodos}>TODOS</MenuItem>
                  </MenuList>
                </Menu>
              </Stack>
              <Stack direction={'row'} spacing={2} mt={2} fontSize="sm" justifyContent={'space-between'}>
                <Select
                  styles={{
                    control: (provided) => ({
                      ...provided,
                      width: '427px',
                      minHeight: '42px',
                    }),
                    menuList: (provided) => ({
                      ...provided,
                      maxHeight: '200px',
                      color: 'black',
                    }),
                  }}
                  options={
                    dataSede.map((sede) => ({
                      value: sede.idSede,
                      label: sede.sede,
                    }))
                  }
                  onChange={handleSelectSede}
                  placeholder="FILTRAR POR SEDES"
                  isMulti
                  isClearable
                  isSearchable
                />
                <IconButton
                  onClick={handleClickFilterBySede}
                  disabled={tableRowsDataSede.length === 0}
                  colorScheme="red"
                  icon={<AiOutlineFileSearch fontSize={24} />}
                />
              </Stack>
            </Box>
          </HStack>
          <DataTableExtensions
            columns={columns}
            data={tableRowsData}
            print={false}
            filterPlaceholder="BUSCAR"
            fileName={'INCIDENCIAS_ASIGNADAS'}
          >
            <DataTable
              theme={theme}
              pagination
              ignoreRowClick={true}
              responsive={true}
              paginationPerPage={10}
              noDataComponent={
                <Text fontSize="sm" py={16} textAlign="center" color="gray.600">
                  NO HAY DATOS PARA MOSTRAR, REFRESCAR LA TABLA
                </Text>
              }
              paginationRowsPerPageOptions={[10, 15, 20, 30]}
              paginationComponentOptions={{
                rowsPerPageText: 'Filas por página:',
                rangeSeparatorText: 'de',
                selectAllRowsItem: true,
                selectAllRowsItemText: 'Todos',
              }}
              customStyles={customStyles}
              key={tableRowsData.map((item) => { return item.idIncidencia })}
            />
          </DataTableExtensions>
        </Box>
      </>
    );
  }


}


export const ModalReAsignarTecnico = ({ row, refreshData, dataForm }) => {
  const [openModal, setOpenModal] = useState(false);
  const dispatch = useDispatch();
  const { identificador } = useSelector(state => state.auth);
  const tecnicosData = store.getState().tecnicoDisponible.rows;

  const [idIncidencia, setIndiceIncidencia] = useState(null);
  const [indiceTecnico, setIndiceTecnico] = useState(null);
  const [indiceIdPersona, setIndiceIdPersona] = useState(null);
  const [incidenciaPersonaNotifica, setIncidenciaPersonaNotifica] = useState(null);


  // filtrar tecnicos que no se repitan en la lista de tecnicos para asignar
  const tecnicoFilter = tecnicosData.filter(p => p.persona.idpersona !== indiceIdPersona);

  const handleClickOpenModal = (index) => {
    var idPersona = index.historialIncidencia.filter(p => p.estado === 'A');
    setIndiceIdPersona(idPersona[0].persona_asignado.idpersona);
    setIndiceIncidencia(index.idIncidencia);
    setIncidenciaPersonaNotifica(index.historialIncidencia.filter(pendiente => pendiente.estadoIncidencia === "P" && pendiente.estado === "A")[0]?.persona_notifica.idpersona);
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setIndiceTecnico(null)
    setIndiceIdPersona(null);
    setOpenModal(false);
  }

  const handleChangeTecnico = (value) => {
    setIndiceTecnico(value.value);
  };

  const fetchDataIncidenciasAsignadas = async () => {
    const response = await fetchIncidenciasAsignadas(dataForm);
    dispatch(getIncidenciaAsignadas(response));
  }

  const ReAsignacionIncidencia = (e) => {
    e.preventDefault();
    var incidencia = {
      idIncidencia: idIncidencia,
      historialIncidencia: [{
        persona_registro: {
          idpersona: Number(identificador)
        },
        persona_asignado: {
          idpersona: indiceTecnico,
        },
        persona_notifica: {
          idpersona: incidenciaPersonaNotifica ? incidenciaPersonaNotifica : Number(identificador),
        }
      }]
    }
    dispatch(reAsignarIncidencia(incidencia))
      .then(() => {
        setOpenModal(false);
        fetchDataIncidenciasAsignadas();
        refreshData();
      }).catch((error) => {
        console.log(error);
      })
  }

  return (
    <>
      <Tooltip hasArrow placement="auto" label="Reasignar La Incidencia" aria-label="Reasignar">
        <IconButton
          icon={<RiUserShared2Line />}
          colorScheme={'teal'}
          onClick={() => handleClickOpenModal(row)}
          fontSize='20px'
          size={'sm'}
          ml={1}
        />
      </Tooltip>

      <Modal
        isOpen={openModal}
        onClose={handleCloseModal}
        size={'4xl'}
      >
        <ModalOverlay />
        <form onSubmit={ReAsignacionIncidencia}>
          <ModalContent>
            <ModalHeader>RE-ASIGNAR A OTRO USUARIO LA INCIDENCIA</ModalHeader>
            <ModalCloseButton />
            <ModalBody pb={6}>
              <FormControl isRequired>
                <FormLabel fontWeight="semibold">LISTA DE USUARIOS PARA RE-ASIGNAR</FormLabel>
                <Select
                  placeholder="SELECCIONE UN USUARIO PARA RE-ASIGNAR"
                  onChange={handleChangeTecnico}
                  options={tecnicoFilter.map(tecnico => ({
                    value: tecnico.persona.idpersona,
                    label: tecnico.persona.nombre + ' ' + tecnico.persona.apellido
                  }))}
                  isSearchable
                />
              </FormControl>
            </ModalBody>
            <ModalFooter>
              <Button disabled={indiceTecnico === null ? true : false} colorScheme="facebook" mr={3} type={'submit'}>
                RE-ASIGNAR
              </Button>
              <Button onClick={handleCloseModal} colorScheme="red" variant="outline">CANCELAR</Button>
            </ModalFooter>
          </ModalContent>
        </form>
      </Modal>
    </>
  )
}