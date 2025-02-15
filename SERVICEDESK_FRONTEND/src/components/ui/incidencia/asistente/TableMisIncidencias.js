import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
    Box,
    Button,
    useColorModeValue,
    AlertDialogBody,
    AlertDialogHeader,
    AlertDialogContent,
    AlertDialogOverlay,
    AlertDialogFooter,
    AlertDialog,
    Text,
    HStack,
    Badge,
    IconButton,
    AlertDialogCloseButton,
    SimpleGrid,
    chakra,
    Flex,
    Menu,
    MenuButton,
    MenuList,
    MenuItem,
    Popover,
    PopoverTrigger,
    Stack,
    PopoverContent,
    PopoverArrow,
    PopoverCloseButton,
    PopoverHeader,
    PopoverBody,
    Portal,
    Progress,
    FormLabel,
    FormControl,
    Tooltip,
    Input,
} from '@chakra-ui/react';
import { CalendarIcon, RepeatIcon, SearchIcon } from '@chakra-ui/icons';

import { store } from '../../../../store/store';

import DataTable, { createTheme } from 'react-data-table-component';
import DataTableExtensions from 'react-data-table-component-extensions';
import 'react-data-table-component-extensions/dist/index.css';

import IncidenciaAgregar from '../IncidenciaAgregar';
import IncidenciaDetalles from '../IncidenciaDetalles';
import IncidenciaAtender from '../soporte/IncidenciaAtender';
import { createDescripcionTramite, fetchMisIncidencias } from '../../../../actions/incidencia';
import Moment from 'moment';
import Select from 'react-select';
import { getMisIncidencias } from './incidencia';
import { FaFilter } from 'react-icons/fa';
import { AiFillFileText, AiFillFilter, AiOutlineFileSearch } from 'react-icons/ai';
import AtencionViewFile from '../conocimiento/AtencionViewFile';
import IncidenciaViewFile from '../conocimiento/IncidenciaViewFile';
import IncidenciaViewFileSoporte from '../soporte/IncidenciaViewFile';
import { ModalReAsignarTecnico } from './TableIncidenciaAsignadas';
import { formats, modules } from '../../../../helpers/quillConfig';
import ReactQuill from 'react-quill';
import { customStyles } from '../../../../helpers/customStyle';
import { SpinnerComponent } from '../../../../helpers/spinner';

export default function TableMisIncidencias() {
    const [openAlert, setOpenAlert] = useState(false);
    const [progress, setProgress] = useState(false);
    const { identificador } = useSelector(state => state.auth);
    const dispatch = useDispatch();

    const [indiceIncidenciaPersonaNotifica, setIncidenciaPersonaNotifica] = useState(identificador);

    const data = store.getState().misIncidencias.rows;
    const dataSede = store.getState().sede.rows;

    const [tableRowsData, setTableRowsData] = useState(data);
    const [tableRowsDataSede, setTableRowsDataSede] = useState([]);
    const [descripcion, setDescripcion] = useState('');
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

    const ContadorPendientes = tableRowsData.filter(row => row.historialIncidencia.filter(pendiente => pendiente.estadoIncidencia === "P" && pendiente.estado === "A").length > 0);
    const ContadorTramite = tableRowsData.filter(row => row.historialIncidencia.filter(tramite => tramite.estadoIncidencia === "T" && tramite.estado === "A").length > 0);
    const ContadorAtendidas = tableRowsData.filter(row => row.historialIncidencia.filter(atendida => atendida.estadoIncidencia === "A" && atendida.estado === "A").length > 0);

    const dataForm = {
        startDate: fechaDesdeValue === null ? fechaDesde : fechaDesdeValue,
        endDate: fechaHastaValue === null ? fechaHasta : fechaHastaValue,
    }

    const fetchDataMisIncidencias = async () => {
        const response = await fetchMisIncidencias(identificador, dataForm);
        dispatch(getMisIncidencias(response));
    }

    useEffect(() => {
        if (store.getState().misIncidencias.checking || store.getState().misIncidencias.length > 0) {
            fetchDataMisIncidencias();
        }
    });

    const handleSearchDataMisIncidencias = () => {
        fetchDataMisIncidencias();
    }

    const changeSetProgressTrue = () => {
        setProgress(true);
    }

    const changeSetProgressFalse = () => {
        setProgress(false);
    }

    const [indice, setIndice] = useState({
        idIncidencia: null,
        historialIncidencia: {
            persona_registro: {
                idpersona: Number(identificador)
            },
            persona_asignado: {
                idpersona: Number(identificador)
            },
            persona_notifica: {
                idpersona: indiceIncidenciaPersonaNotifica ? Number(indiceIncidenciaPersonaNotifica) : Number(identificador),
            }
        }
    });

    const ActualizarIncidenciaEnTramite = () => {
        var detallesObservacion = {
            incidencia: indice.idIncidencia,
            descripcion: descripcion,
            archivo: null
        }
        dispatch(createDescripcionTramite(detallesObservacion))
            .then(() => {
                fetchDataMisIncidencias();
                setOpenAlert(false);
            }).catch((error) => {
                console.log(error);
            });
    }

    const handleClickOpenAlert = (index) => {
        setIndice({ ...indice, idIncidencia: index.idIncidencia });
        setIncidenciaPersonaNotifica(index.historialIncidencia.filter(pendiente => pendiente.estadoIncidencia === "P" && pendiente.estado === "A")[0].persona_notifica.idpersona);
        setOpenAlert(true);
    };

    const handleCloseAlert = () => {
        setDescripcion('');
        setOpenAlert(false);
    };

    const refreshTable = () => {
        fetchDataMisIncidencias();
    }

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

    const columns = [
        {
            name: 'USUARIO',
            selector: row => row.persona?.nombre + ' ' + row.persona?.apellido,
            cellExport: row => row.persona?.nombre + ' ' + row.persona?.apellido,
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
            name: 'IP',
            selector: row => row.historialIncidencia.filter(p => p.estado === 'A' ? p.ip : null),
            sortable: true,
            cell: row => {
                var historial = row.historialIncidencia.filter(p => p.estado === 'A' ? p.ip : null);
                return (
                    <Text>
                        {historial[0].ip}
                    </Text>
                )
            },
            cellExport: row => {
                var historial = row.historialIncidencia.filter(p => p.estado === 'A' ? p.ip : null);
                return (
                    historial[0].ip
                )
            }
        },
        {
            name: 'ESTADO',
            sortable: true,
            cell: row => {
                var historial = row.historialIncidencia.filter(p => p.estado === 'A');
                return (
                    <div>
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
                    </div>
                )
            },
            cellExport: row => {
                var historial = row.historialIncidencia.filter(p => p.estado === 'A');
                return (
                    historial[0].estadoIncidencia === 'P' ? 'PENDIENTE' : historial[0].estadoIncidencia === 'T' ? 'EN TRÁMITE' : 'ATENDIDO'
                )
            },
            center: true,
        },
        {
            name: 'ACCIONES',
            sortable: false,
            cell: row => {
                var historial = row.historialIncidencia.filter(p => p.estado === 'A');
                let archivoTecnico = row.descripcionIncidencia?.incidenciaArchivos?.usuario === "T" ? row.descripcionIncidencia?.incidenciaArchivos : null;
                let archivoUsuario = row.incidenciaArchivos?.usuario === "R" ? row.incidenciaArchivos : null;
                return (
                    <div>
                        {historial[0].estadoIncidencia === 'P' ? (
                            <div>
                                <IncidenciaDetalles
                                    rowId={row.idIncidencia}
                                    identificador={identificador}
                                />
                                {archivoUsuario !== null ? (
                                    <IncidenciaViewFileSoporte
                                        rowData={row.incidenciaArchivos}
                                        typeFile={archivoUsuario.file}
                                        setProgressTrue={() => changeSetProgressTrue()}
                                        setProgressFalse={() => changeSetProgressFalse()}
                                    />
                                ) : (null)}
                                <Tooltip hasArrow placement="auto" label="Cambiar a Trámite el Estado" aria-label="A tooltip">
                                    <IconButton
                                        icon={<CalendarIcon />}
                                        variant={'outline'}
                                        colorScheme={'yellow'}
                                        onClick={() => handleClickOpenAlert(row)}
                                        size={'sm'}
                                        fontSize={'20px'}
                                        ml={1}

                                    />
                                </Tooltip>
                                <ModalReAsignarTecnico row={row} refreshData={() => refreshTable()} />
                                <IncidenciaAtender
                                    rowId={row.idIncidencia}
                                    descripcionIncidencia={row.descripcionIncidencia}
                                />
                            </div>
                        ) : (
                            historial[0].estadoIncidencia === 'T' ? (
                                <>
                                    <IncidenciaDetalles
                                        rowId={row.idIncidencia}
                                        identificador={identificador}
                                    />
                                    {archivoUsuario !== null ? (
                                        <IncidenciaViewFileSoporte
                                            rowData={row.incidenciaArchivos}
                                            typeFile={archivoUsuario.file}
                                            setProgressTrue={() => changeSetProgressTrue()}
                                            setProgressFalse={() => changeSetProgressFalse()}
                                        />
                                    ) : (null)}
                                    <IncidenciaAtender
                                        rowId={row.idIncidencia}
                                        descripcionIncidencia={row.descripcionIncidencia}
                                    />
                                </>
                            ) : (
                                <>
                                    <IncidenciaDetalles
                                        rowId={row.idIncidencia}
                                        identificador={identificador}
                                    />
                                    {archivoTecnico === null && archivoUsuario === null ? null : (
                                        <Popover placement='left'>
                                            <PopoverTrigger>
                                                <Box as="a" cursor={'pointer'}>
                                                    <Tooltip hasArrow placement="auto" label="Visualizar Archivos de la Incidencia" aria-label="A tooltip">
                                                        <IconButton
                                                            size="sm"
                                                            colorScheme="purple"
                                                            icon={<AiFillFileText />}
                                                            ml={1}
                                                            fontSize={'20px'}
                                                            _focus={{ boxShadow: 'none' }}
                                                        />
                                                    </Tooltip>
                                                </Box>
                                            </PopoverTrigger>
                                            <Portal>
                                                <PopoverContent _focus={{ boxShadow: 'none' }}>
                                                    <PopoverArrow />
                                                    <PopoverCloseButton _focus={{ boxShadow: 'none' }} />
                                                    <PopoverHeader>VISUALIZAR ARCHIVO</PopoverHeader>
                                                    <PopoverBody>
                                                        <Stack direction={'column'} spacing={4} alignItems="start">
                                                            {archivoUsuario !== null ? (
                                                                <IncidenciaViewFile
                                                                    rowData={row?.incidenciaArchivos}
                                                                    typeFile={archivoUsuario?.file}
                                                                    setProgressTrue={() => changeSetProgressTrue()}
                                                                    setProgressFalse={() => changeSetProgressFalse()}
                                                                />
                                                            ) : null}

                                                            {archivoTecnico !== null ? (
                                                                <AtencionViewFile
                                                                    rowData={row.descripcionIncidencia?.incidenciaArchivos}
                                                                    typeFile={archivoTecnico?.file}
                                                                    setProgressTrue={() => changeSetProgressTrue()}
                                                                    setProgressFalse={() => changeSetProgressFalse()}
                                                                />
                                                            ) : null}
                                                        </Stack>
                                                    </PopoverBody>
                                                </PopoverContent>
                                            </Portal>
                                        </Popover>
                                    )}
                                </>
                            )
                        )}
                        <AlertDialog isOpen={openAlert} onClose={handleCloseAlert} size={'6xl'}>
                            <AlertDialogOverlay>
                                <AlertDialogContent>
                                    <AlertDialogHeader fontSize="xl" fontWeight="bold">
                                        ¿DESEA CAMBIAR EL ESTADO, EN TRÁMITE?
                                    </AlertDialogHeader>
                                    <AlertDialogCloseButton />
                                    <AlertDialogBody>
                                        <FormControl isRequired>
                                            <FormLabel fontWeight="semibold">AGREGAR UNA OBSERVACIÓN</FormLabel>
                                            <ReactQuill
                                                theme="snow"
                                                placeholder="INGRESE UNA OBSERVACIÓN"
                                                modules={modules}
                                                formats={formats}
                                                onChange={(e) => setDescripcion(e.valueOf())}
                                            />
                                        </FormControl>
                                    </AlertDialogBody>
                                    <AlertDialogFooter>
                                        <Button onClick={handleCloseAlert} colorScheme="red" variant="outline">CANCELAR</Button>
                                        <Button
                                            bg={'yellow.500'}
                                            _hover={{ bg: 'yellow.600' }}
                                            color={'white'}
                                            ml={3}
                                            disabled={(descripcion.length < 5 || descripcion === '') ? true : false}
                                            onClick={() => ActualizarIncidenciaEnTramite()}
                                        >
                                            CONFIRMAR
                                        </Button>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialogOverlay>
                        </AlertDialog>
                    </div>
                );
            },
            width: '220px',
            export: false,
            wrap: true,
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

    if (store.getState().misIncidencias.checking === true) {
        return (
            <SpinnerComponent />
        )
    } else {
        return (
            <>
                <Box
                    borderWidth="1px"
                    borderRadius="lg"
                    overflow="hidden"
                    boxShadow={'md'}
                    mb={4}
                    p={2}
                    fontSize={['6px', '9px', '10px', '12px']}
                    bg={bg}>
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
                        px={4}
                        mt={4}
                    >
                        <Box>
                            <Text fontSize="lg" fontWeight="600">
                                MIS INCIDENCIAS ASIGNADAS
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
                                    onClick={handleSearchDataMisIncidencias}
                                />
                            </Stack>
                        </Box>
                        <Box>
                            <Stack direction={'row'} spacing={4} justifyContent="space-between">
                                <IconButton
                                    size={'sm'}
                                    icon={<RepeatIcon boxSize={4} />}
                                    colorScheme={'facebook'}
                                    onClick={refreshTable}
                                />
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
                                <IncidenciaAgregar />
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
                    <Progress mt={2} size="xs" value={progress} colorScheme="purple" hidden={progress === false} isIndeterminate={progress === true} mb={2} />
                    <DataTableExtensions
                        columns={columns}
                        data={tableRowsData}
                        print={false}
                        filterPlaceholder="BUSCAR"
                        fileName={'MIS_INCIDENCIAS_ASIGNADAS'}
                    >
                        <DataTable
                            defaultSortAsc={false}
                            theme={theme}
                            pagination
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
