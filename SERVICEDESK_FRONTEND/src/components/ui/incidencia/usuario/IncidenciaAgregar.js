import React, { useState, useEffect, useRef } from 'react';
import {
  Button,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  FormControl,
  FormLabel,
  HStack,
  InputGroup,
  InputRightElement,
  IconButton,
  Input,
  Stack,
  Text,
  RadioGroup,
  Radio,
  Tabs,
  TabList,
  Tab,
  TabPanels,
  TabPanel,
  Image,
  Box,
  Table,
  Thead,
  Tr,
  Th,
  Tbody,
  Td,
} from '@chakra-ui/react';

import Select from 'react-select';

import { AddIcon, SearchIcon } from '@chakra-ui/icons';

import { store } from '../../../../store/store';
import { useDispatch, useSelector } from 'react-redux';
import { getIncidenciaId } from './incidencia';

import {
  fetchIncidenciasPersonas,
  createIncidenciaUsuario,
  buscarUsuarioDni
} from '../../../../actions/incidencia';

import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { formats, modules } from '../../../../helpers/quillConfig';
import { notification } from '../../../../helpers/alert';
import { buscarPersonaApellido } from '../../../../actions/persona';
import { fetchHistorialPersona } from '../../../../actions/historialpersona';
import { AiOutlineFileSearch } from 'react-icons/ai';
import moment from 'moment';

const IncidenciaAgregar = () => {
  const [openCreate, setOpenCreate] = React.useState(false);
  const dispatch = useDispatch();

  const motivoData = store.getState().motivo.rows;
  const origenData = store.getState().origenIncidencia.rows;

  const origenIncidencia = origenData.filter(row => row.origen === 'SISTEMA');

  const { identificador } = useSelector(state => state.auth);

  const [indiceMotivo, setIndiceMotivo] = useState(null);

  const [indiceIncidencia, setIndiceIncidencia] = useState({
    descripcion: null,
  });

  const [incidenciaArchivos, setIncidenciaArchivos] = useState(null);
  const [openSearch, setOpenSearchUsuarios] = useState(false);
  const [radioUserValue, setRadioUserValue] = useState('mismo');
  const [radioValue, setRadioValue] = useState('apellido');
  const [usuarioApellido, setUsuarioApellido] = useState('');
  const [usuarioListData, setUsuarioListData] = useState([]);
  const [usuarioNotificaDNI, setUsuarioNotificaDNI] = useState('');
  const [usuarioNotificaId, setUsuarioNotificaId] = useState(null);
  const [dataNombresNotifica, setDataNombresNotifica] = useState('');
  const [usuarioDataNombre, setUsuarioDataNombre] = useState(null);
  const [indiceUsuario, setIndiceUsuario] = useState(null);
  const [usuarioSede, setUsuarioSede] = useState(null);
  const [usuarioOrgano, setUsuarioOrgano] = useState(null);
  const [usuarioOficina, setUsuarioOficina] = useState(null);
  const [usuarioCargo, setUsuarioCargo] = useState(null);

  const [openModal, setOpenModal] = useState(false);


  const inputRefDNI = useRef(null);
  const inputRefApellido = useRef(null);

  const handleCloseModalFile = () => {
    setOpenModal(false);
  }

  const handleClickOpenCreate = () => {
    setOpenCreate(true);
  };

  const handleResetValues = () => {
    setRadioUserValue('mismo');
    setRadioValue('apellido');
    setUsuarioNotificaDNI('');
    setUsuarioNotificaId(null);
    setDataNombresNotifica('');
    setUsuarioApellido('');
    setUsuarioDataNombre('');
    setIncidenciaArchivos(null);
    setUsuarioSede(null);
    setUsuarioOrgano(null);
    setUsuarioOficina(null);
    setUsuarioCargo(null);
    inputRefDNI.current.value = "";
    inputRefApellido.current.value = "";
  }

  const handleCloseModal = () => {
    handleResetValues();
    setOpenCreate(false);
  };

  const fetchDataId = async () => {
    const response = await fetchIncidenciasPersonas(identificador);
    dispatch(getIncidenciaId(response));
  }

  useEffect(() => {
    if (store.getState().incidenciaId.checking) {
      fetchDataId();
    }
  });

  const saveHistorialPersona = () => {

    var incidencia = {
      persona: {
        idpersona: usuarioNotificaId === null ? identificador : usuarioNotificaId,
      },
      motivo: {
        idMotivo: indiceMotivo,
      },
      descripcion: indiceIncidencia.descripcion,
      origen: {
        idOrigen: origenIncidencia[0].idOrigen,
      },
      historialIncidencia: [{
        persona_registro: {
          idpersona: identificador,
        },
        persona_notifica: {
          idpersona: identificador,
        }
      }],
      archivo: incidenciaArchivos,
    }
    dispatch(createIncidenciaUsuario(incidencia))
      .then(() => {
        handleCloseModal(true);
        fetchDataId();
      })
      .catch(err => {
        console.log(err);
      });
  };

  const handleChangeMotivo = value => {
    setIndiceMotivo(value.value);
  };

  const handleSubmitFile = (e) => {
    setIncidenciaArchivos(e.target.files[0]);
  }

  const handleChangeUserRadio = (value) => {
    handleResetValues();
    setRadioUserValue(value);
  }

  const buscarPorDni = async () => {
    await buscarUsuarioDni(usuarioNotificaDNI).then((res) => {
      fetchHistorialPersona(res.idpersona).then(historial => {
        setUsuarioSede(historial.data.oficina.organo.sede.sede)
        setUsuarioOrgano(historial.data.oficina.organo.organo)
        setUsuarioOficina(historial.data.oficina.oficina)
        setUsuarioCargo(historial.data.cargo.cargo)
      }).catch(() => {
        notification('HISTORIAL NO ENCONTRADO', 'EL USUARIO NO PERTENECE A NINGUNA SEDE, ORGANO U OFICINA', 'info', 'modalCrearIncidencia');
        handleResetValues();
      });
      setUsuarioNotificaId(res.idpersona);
      setDataNombresNotifica(res.nombre + ' ' + res.apellido);
    }).catch(() => {
      notification('USUARIO NO ENCONTRADO', 'NO SE LOGRÓ ENCONTRAR EL USUARIO, INTENTE DE NUEVO', 'error', 'modalCrearIncidencia');
      handleResetValues();
    });
  }

  const buscarPorApellido = async () => {
    await buscarPersonaApellido(usuarioApellido).then((res) => {
      if (res.data.length > 0) {
        setUsuarioListData(res.data);
        setOpenSearchUsuarios(true);
      } else {
        notification('USUARIO NO ENCONTRADO', 'NO SE LOGRÓ ENCONTRAR EL USUARIO CON ESE APELLIDO, INTENTE DE NUEVO', 'error', 'modalCrearIncidencia');
        handleResetValues()
      }
    }).catch(() => {
      notification('USUARIO NO ENCONTRADO', 'NO SE LOGRÓ ENCONTRAR EL USUARIO, INTENTE DE NUEVO', 'error', 'modalCrearIncidencia');
      handleResetValues()
    })
  }

  const seleccionarUsuario = async (usuario) => {
    await fetchHistorialPersona(usuario).then(historial => {
      setUsuarioDataNombre(historial?.data.persona.nombre + ' ' + historial.data.persona.apellido);
      setUsuarioNotificaId(historial?.data.persona.idpersona);
      setUsuarioSede(historial?.data.oficina.organo.sede.sede);
      setUsuarioOrgano(historial?.data.oficina.organo.organo);
      setUsuarioOficina(historial?.data.oficina.oficina);
      setUsuarioCargo(historial?.data.cargo.cargo);
    }).catch(() => {
      setOpenSearchUsuarios(false);
      notification('HISTORIAL NO ENCONTRADO', 'EL USUARIO NO PERTENECE A NINGUNA SEDE, ORGANO U OFICINA', 'error', 'modalCrearIncidencia');
      handleResetValues();
    })
  }

  const handleSearchDNI1 = () => {
    buscarPorDni();
  }

  const handleChangeUsuario = (value) => {
    if (value === null) {
      return "SELECCIONE UN USUARIO"
    } else {
      seleccionarUsuario(value.value);
      setIndiceUsuario(value.value);
    }
  }

  const handleCloseModalSearch = () => {
    setOpenSearchUsuarios(false);
  }

  const handleSearchApellido = () => {
    buscarPorApellido();
  }

  const handlePreviewFile = () => {
    setOpenModal(true)
  }

  const handleTabChange = (event) => {
    if( event.target.value === "dni"){
      inputRefApellido.current.value = "";
    } else {
      inputRefDNI.current.value = "";
    }
    setUsuarioSede(null);
    setUsuarioOrgano(null);
    setUsuarioOficina(null);
    setUsuarioCargo(null);
    setUsuarioDataNombre(null);
    setDataNombresNotifica(null);
    setUsuarioNotificaId(null);
  }

  return (
    <>
      <Button leftIcon={<AddIcon />} size="sm" onClick={handleClickOpenCreate} colorScheme={'facebook'} >
        NUEVA INCIDENCIA
      </Button>

      <Modal
        id="modalCrearIncidencia"
        isOpen={openCreate}
        onClose={handleCloseModal}
        closeOnOverlayClick={true}
        size={'6xl'}
      >
        <ModalOverlay />
        <ModalContent>
          <ModalHeader textAlign={'center'}>CREAR NUEVA INCIDENCIA</ModalHeader>
          <ModalCloseButton  />
          <ModalBody pb={2}>
            <FormControl isRequired mt="-5">
              <FormLabel fontWeight="bold">MOTIVO</FormLabel>
              <Select
                placeholder="SELECCIONAR UN MOTIVO"
                onChange={handleChangeMotivo}
                options={motivoData.map(motivo => ({
                  value: motivo.idMotivo,
                  label: motivo.motivo
                }))}
                isSearchable
              />
            </FormControl>
            <Stack direction={['column', 'column', 'row', 'row']} spacing={2} mb={2} mt={2} justify="space-between" >
              <Text fontWeight={'semibold'}>USUARIO CON PROBLEMA</Text>
              <RadioGroup onChange={handleChangeUserRadio} value={radioUserValue}>
                <Stack direction='row' fontWeight="bold">
                  <Radio size='md' value='mismo'  defaultChecked={true}>MI PERSONA</Radio>
                  <Radio size='md' value='otro' >OTRO USUARIO</Radio>
                </Stack>
              </RadioGroup>
            </Stack>

            <Stack direction={'column'} spacing={2} mt={2} hidden={radioUserValue === 'mismo'} >
              <Tabs variant="enclosed-colored" w="full" size={'sm'}>
                <TabList textAlign="center" justifyContent="center" onClick={handleTabChange} >
                  <Tab  value="apellidos" defaultChecked fontWeight="bold">BUSQUEDA POR APELLIDOS</Tab>
                  <Tab  value="dni" fontWeight="bold">BUSQUEDA POR DNI</Tab>
                </TabList>
                <TabPanels>
                  <TabPanel>
                    <HStack spacing={2}>
                      <FormControl isRequired={radioValue === 'apellido'} zIndex={0}>
                        <FormLabel fontWeight="bold" fontSize="sm">BUSQUEDA POR APELLIDOS AL USUARIO CON PROBLEMA</FormLabel>
                        <InputGroup>
                          <InputRightElement
                            boxSize={8}
                            children={
                              <IconButton
                                colorScheme='facebook'
                                size={'sm'}
                                borderRadius="none"
                                onClick={handleSearchApellido}
                                icon={<SearchIcon />}
                                
                                disabled={usuarioApellido === null || usuarioApellido.length < 3}
                              />
                            }
                          />
                          <Input placeholder="INGRESE EL APELLIDO" size={'sm'} ref={inputRefApellido} textTransform={'uppercase'} onChange={e => { setUsuarioApellido(e.target.value.toUpperCase()) }} />
                        </InputGroup>
                      </FormControl>

                      <Modal
                        isOpen={openSearch}
                        onClose={handleCloseModalSearch}
                        size={'2xl'}
                      >
                        <ModalOverlay />
                        <ModalContent>
                          <ModalHeader>LISTA DE USUARIOS CON EL APELLIDO BUSCADO</ModalHeader>
                          <ModalCloseButton  onClick={handleCloseModalSearch} />
                          <ModalBody pb={6}>
                            <FormControl>
                              <FormLabel fontWeight="bold">LISTA DE USUARIOS</FormLabel>
                              <Select
                                placeholder="SELECCIONE UN USUARIO"
                                onChange={handleChangeUsuario}
                                options={usuarioListData?.map(usuario => ({
                                  value: usuario.idpersona,
                                  label: usuario.apellido + ', ' + usuario.nombre
                                }))}
                                isSearchable
                                isClearable
                              />
                            </FormControl>
                          </ModalBody>
                          <ModalFooter>
                            <Button onClick={handleCloseModalSearch} disabled={indiceUsuario === null} colorScheme="facebook">ACEPTAR</Button>
                          </ModalFooter>
                        </ModalContent>
                      </Modal>

                      <FormControl isRequired>
                        <FormLabel fontWeight="bold" fontSize="sm">NOMBRE DEL USUARIO CON PROBLEMA</FormLabel>
                        <Input placeholder='NOMBRES APELLIDOS' size={'sm'} value={usuarioDataNombre ? usuarioDataNombre : ''} readOnly />
                      </FormControl>
                    </HStack>
                  </TabPanel>
                  <TabPanel>
                    <Stack direction={['column', 'column', 'row', 'row']} spacing={2} justify="space-between">
                      <FormControl isRequired={radioUserValue === 'otro'} zIndex={0}>
                        <FormLabel fontWeight="bold" fontSize="sm">BUSQUEDA POR DNI AL USUARIO QUIEN REPORTÓ</FormLabel>
                        <InputGroup>
                          <InputRightElement
                            boxSize={8}
                            children={
                              <IconButton
                                colorScheme='facebook'
                                size={'sm'}
                                borderRadius="none"
                                onClick={handleSearchDNI1}
                                icon={<SearchIcon />}
                                
                                disabled={usuarioNotificaDNI === '' || usuarioNotificaDNI.length < 8 || usuarioNotificaDNI.length > 8}
                              />
                            }
                          />
                          <Input ref={inputRefDNI} size={'sm'} placeholder="DIGITE EL DNI" onChange={e => { setUsuarioNotificaDNI(e.target.value) }} />
                        </InputGroup>
                      </FormControl>
                      <FormControl isRequired>
                        <FormLabel fontWeight="bold" fontSize="sm">NOMBRE DEL USUARIO QUIEN REPORTÓ</FormLabel>
                        <Input placeholder='NOMBRES APELLIDOS' size="sm" value={dataNombresNotifica ? dataNombresNotifica : ''} readOnly />
                      </FormControl>
                    </Stack>
                  </TabPanel>
                </TabPanels>
              </Tabs>
            </Stack>

            <Stack 
              direction={['column', 'column', 'row', 'row']} 
              mb={2}
              justify="space-between" 
              hidden={radioUserValue === 'mismo'}>
              <Table variant="striped" size="sm">
                <Thead>
                  <Tr>
                    <Th>SEDE</Th>
                    <Th>ORGANO</Th>
                    <Th>OFICINA</Th>
                    <Th>CARGO</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  <Tr>
                    <Td fontSize={'xs'}>{ usuarioSede }</Td>
                    <Td fontSize={'xs'}>{ usuarioOrgano }</Td>
                    <Td fontSize={'xs'}>{ usuarioOficina }</Td>
                    <Td fontSize={'xs'}>{ usuarioCargo }</Td>
                  </Tr>
                </Tbody>
              </Table>
            </Stack>

            {/* ----------------- */}

            <FormControl>
              <FormLabel fontWeight="bold">DESCRIPCIÓN DE LA INCIDENCIA</FormLabel>
              <ReactQuill
                theme="snow"
                modules={modules}
                formats={formats}
                placeholder="Aqui describe la incidencia"
                textTransform={'uppercase'}
                onChange={(e) => {
                  setIndiceIncidencia({
                    ...indiceIncidencia,
                    descripcion: e.valueOf(),
                  });
                }}
              />
            </FormControl>
            <FormControl mt={2}>
              <FormLabel fontWeight="bold">SUBIR ARCHIVO(opcional)</FormLabel>
              <InputGroup size='md'>
                <Input
                  type='file'
                  onChange={e => handleSubmitFile(e)}
                  name='archivo'
                  accept='image/*, application/*'
                />
                <InputRightElement>
                  <IconButton colorScheme={'telegram'}
                    size={'sm'}
                    hidden={incidenciaArchivos === null}
                    icon={<AiOutlineFileSearch fontSize="20px" />}
                    onClick={handlePreviewFile}
                    _focus={{ boxShadow: 'none' }} />
                </InputRightElement>
                <ModalPreviewFile
                  size={'2xl'}
                  file={incidenciaArchivos}
                  archivo={incidenciaArchivos}
                  open={openModal}
                  onClose={handleCloseModalFile}
                />
              </InputGroup>
            </FormControl>
          </ModalBody>
          <ModalFooter>
            <Button
              disabled={
                radioUserValue === 'mismo' ? (
                  indiceMotivo === null || indiceIncidencia.descripcion === null ? true : false
                ) : (
                  indiceMotivo === null || indiceIncidencia.descripcion === null || usuarioNotificaId === null ? true : false
                )
              }
              colorScheme={'facebook'}
              autoFocus mr={3}
              
              onClick={() => saveHistorialPersona()}
            >
              GUARDAR
            </Button>
            <Button onClick={handleCloseModal}  colorScheme="red" variant="outline">CANCELAR</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default IncidenciaAgregar;

const ModalPreviewFile = ({ open, onClose, file }) => {
  const [filePreview, setFilePreview] = useState(null);

  useEffect(() => {
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFilePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  }, [file]);

  return (
    <Modal isOpen={open} onClose={onClose} size={'5xl'}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader textAlign={'center'} fontWeight='extrabold'>PREVISUALIZACIÓN DEL ARCHIVO</ModalHeader>
        <ModalCloseButton  />
        <ModalBody pb={2} maxH={'80%'}>
          <Stack direction={'row'} justifyContent="space-around" spacing={2} mb={6} textAlign="center" alignItems="center" w={'full'}>
            <HStack spacing={2} align="baseline">
              <Text fontSize={'xs'} fontWeight={'bold'}>NOMBRE DEL ARCHIVO:</Text>
              <Text fontSize={'xs'}>{file?.name}</Text>
            </HStack>
            <HStack spacing={2} align="baseline">
              <Text fontSize={'xs'} fontWeight={'bold'}>TAMAÑO:</Text>
              <Text fontSize={'xs'}>{(file?.size / 1000000).toFixed(2)} MB</Text>
            </HStack>
            <HStack spacing={2} align="baseline">
              <Text fontSize={'xs'} fontWeight={'bold'}>FECHA ACTUAL:</Text>
              <Text fontSize={'xs'}>{ moment(Date(file?.lastModifiedDate)).format('YYYY/MM/DD : HH:mm:ss') }</Text>
            </HStack>
          </Stack>
          <Box display={'flex'} justifyContent={'center'} alignItems={'center'} w="full" borderWidth="1px" borderRadius={'lg'}>
            {file?.type.includes('image') ? (
              <Image src={filePreview} alt={file?.name} maxBlockSize={'60vh'} />
            ) : file?.type.includes('pdf') ? (
              <iframe src={filePreview} title={file?.name} width="100%" height="450px" />
            ) : (
              <Stack direction="column" textAlign="center" alignItems="center">
                <Text fontSize={'sm'} fontWeight={'bold'} textAlign="center" color={'red.500'} mb={4}>No se puede previsualizar el archivo</Text>
                <Image src={"https://pngimg.com/uploads/folder/folder_PNG100476.png"} textAlign="center" w={'150px'} />
              </Stack>
            )}
          </Box>
        </ModalBody>
        <ModalFooter>
          <Button onClick={onClose} _focus={{ boxShadow: 'none' }} colorScheme="green">OK</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
