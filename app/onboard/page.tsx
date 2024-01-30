'use client'
import { useState } from 'react'
import { FaUserDoctor } from 'react-icons/fa6'
import { MdSick } from 'react-icons/md'
import { TbPhysotherapist } from 'react-icons/tb'
import { AiOutlineUser, AiFillSafetyCertificate, AiOutlineCalendar, AiOutlineInbox } from 'react-icons/ai'
import { FaCog } from 'react-icons/fa'
import { BiStore } from 'react-icons/bi'
import { useRouter } from 'next/navigation'

export default function OnBoard() {
  const [current, setCurrent] = useState(0);
  const [perfil, setPerfil] = useState(0);
  const [confirma, setConfirma] = useState(false);
  const router = useRouter();

  const nextSlide = () => {
      if(current === 3) {
        router.push('/modulos/home');
      }
      else setCurrent(current + 1);
  }
  
  const toggleConfirma = (event: any) => {
    setConfirma(event.target.checked);
  }

  return (    
    <div className="overflow-hidden relative">
      <div className={`flex transition ease-out duration-40`}
          style={{
          transform: `translateX(-${current * 100}%)`,
          }}>

          <div className="w-full">
            <div className="w-screen text-center md:p-6">
              <img className="w-full p-20" src='/onboard_02.png'/>
              <span className="text-cyan-800 text-2xl my-4">Selecciona tu perfil</span>
              <div className="w-full flex space-x-4 p-4 text-center">
                <div className={`w-1/3 shadow-md p-2 rounded-lg hover:scale-105 border-2 hover:border-blue-100 ${perfil == 1 ? 'text-white bg-blue-400' : 'text-cyan-600'}`}
                onClick={() => setPerfil(1)}>
                  <FaUserDoctor className="text-8xl m-auto mt-2"/>
                  <p className="my-2">Médico</p>
                </div>
                <div className={`w-1/3 shadow-md p-2 rounded-lg hover:scale-105 border-2 hover:border-blue-100 ${perfil == 2 ? 'text-white bg-blue-400' : 'text-cyan-600'}`}
                onClick={() => setPerfil(2)}>
                  <TbPhysotherapist className="text-8xl m-auto mt-2"/>
                  <p className="my-2">Terapeuta</p>
                </div>
                <div className={`w-1/3 shadow-md p-2 rounded-lg hover:scale-105 border-2 hover:border-blue-100 ${perfil == 3 ? 'text-white bg-blue-400' : 'text-cyan-600'}`}
                onClick={() => setPerfil(3)}>
                  <MdSick className="text-8xl m-auto mt-2"/>
                  <p className="my-2">Paciente</p>
                </div>
              </div>
            </div>
          </div>   

          <div className="w-full">
            <div className="w-screen text-center p-6">
              {perfil!=3 ?
              <div className="w-full">
                <div className="w-full py-6">
                  <h1 className="text-cyan-800 text-2xl">Sube tus títulos</h1>
                  <span>Estos avalarán tu identidad y especialidad</span>
                </div>
                <div className="max-w-2xl mx-auto">
                  <div className="flex items-center justify-center w-full">
                      <label htmlFor="dropzone-file" className="flex flex-col items-center justify-center w-full h-64 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:hover:bg-bray-800 dark:bg-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:hover:border-gray-500 dark:hover:bg-gray-600">
                          <div className="flex flex-col items-center justify-center pt-5 pb-6">
                              <svg className="w-10 h-10 mb-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path></svg>
                              <p className="mb-2 text-sm text-gray-500 dark:text-gray-400"><span className="font-semibold">Click para subir</span> or arrastrar/soltar</p>
                              <p className="text-xs text-gray-500 dark:text-gray-400">PDF (MAX. 6GB)</p>
                          </div>
                          <input id="dropzone-file" type="file" className="hidden" />
                      </label>
                  </div>
                  <div className="flex justify-center mt-4">
                    <input id="checked-checkbox" type="checkbox" onClick={toggleConfirma} className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"/>
                    <label htmlFor="checked-checkbox" className="ms-2 text-sm font-medium text-gray-900 dark:text-gray-300">Confirmo que es información legítima</label>
                  </div>                  
                </div>
              </div> :
              <div className="w-full">PACIENTE</div>
              }
            </div>
          </div>   
          
          <div className='w-full'>
            <div className="w-screen text-center p-6">
              {perfil!=3 ? 
                <div className="w-full pb-6">
                  <img className="m-auto" src="/onboard_01.png"/>
                  <div className="w-full p-6">
                    <h1 className="text-cyan-800 text-2xl">Completa tu perfil</h1>
                    <span>Una vez que cumpletes tu información, serás parte del gran mundo digital de la salud.</span>
                  </div>
                  <div className="w-full m-auto absolute">
                    <AiOutlineUser size="12rem" className="bg-teal-600 rounded-full p-2 text-white m-auto"/>
                    <AiFillSafetyCertificate size="6rem" className="text-lime-500 relative left-1/2 -top-14 translate-x-6"/>
                  </div>                                    
                  <div className="w-full pt-60">
                    <span>Haciéndo click en éste ícono podrás completar tu información de perfil</span>
                  </div>
                </div>
               :
              <div className="w-full">PACIENTE 2</div>
              }
            </div>
          </div>

          <div className='w-full'>
            <div className="w-screen text-center p-6">
              {perfil!=3 ? 
                <div className="w-full pb-6 space-y-6 py-6">
                  <h1 className="text-teal-800 text-2xl">Todo ésto puedes hacer</h1>
                  <span>Descubre las posibilidades de cada módulo disponible</span>
                  <div className="w-full flex shadow-md p-4">
                    <div className="w-20">
                      <AiOutlineCalendar className="bg-teal-800 text-white rounded-md p-2" size="4rem"/>
                    </div>
                    <div className="text-left ml-4 col-span-8">
                      <h2 className="text-teal-800 text-lg">Agenda</h2>
                      <span>Todo respecto a tus citas con pacientes</span>
                    </div>
                  </div>
                  <div className="w-full flex shadow-md p-4">
                    <div className="w-20">
                      <AiOutlineInbox className="bg-teal-800 text-white rounded-md p-2" size="4rem"/>
                    </div>
                    <div className="text-left ml-4 col-span-8">
                      <h2 className="text-teal-800 text-lg">Antecedentes</h2>
                      <span>Para estudiar el historial y exámenes de un paciente</span>
                    </div>
                  </div>
                  <div className="w-full flex shadow-md p-4">
                    <div className="w-20">
                      <BiStore className="bg-teal-800 text-white rounded-md p-2" size="4rem"/>
                    </div>
                    <div className="text-left ml-4">
                      <h2 className="text-teal-800 text-lg">Market-Place</h2>
                      <span>Gestiona qué servicios de salud entregas a los usuario. Configura tus campañas y analiza resultados.</span>
                    </div>
                  </div>
                  <div className="w-full flex shadow-md p-4">
                    <div className="w-20">
                      <FaCog className="bg-teal-800 text-white rounded-md p-2" size="4rem"/>
                    </div>
                    <div className="text-left ml-4">
                      <h2 className="text-teal-800 text-lg">Configuraciones</h2>
                      <span>Gestiona notificaciones, avisos, visuales y otros para personalizar tu experiencia</span>
                    </div>
                  </div>
                </div>
               :
                <div className="w-full pb-6">
                  <div className="w-full">PACIENTE 3</div>
                </div>              
              }
            </div>
          </div>   
      </div>      
      <div className="fixed right-10 bottom-6">
        <button className={`w-full flex justify-center rounded-md bg-blue-600 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 ${(current == 0 && perfil==0)
            || current == 1 && perfil !=3 && !confirma ? 'opacity-40' : ''}`}
          onClick={nextSlide}
          disabled={(current == 0 && perfil==0)
            || current == 1 && perfil !=3 && !confirma}>{current < 3 ? 'Siguiente ▶▶' : 'Finalizar ☑'}</button>
      </div>      
    </div>      
  )
}
