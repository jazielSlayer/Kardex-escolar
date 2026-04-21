import React from "react";
import { createRoot} from "react-dom/client";
import { Routes, Route, BrowserRouter } from "react-router-dom";

import { AuthProvider } from "./Authcontext";
import RutaProtegida   from "./RutaProtegida";

import LoginPantalla from "./Login";
import Verificacion from "./Verificacion";

import PlantelPantalla from "./Plantel_Pantalla";
import EstudiantePantalla from "./Estudiante_Pantalla";
import DocentesPantalla from "./Docentes_Pantalla";
import Admin from "./Admin/Admin"
import RegistrarEstudiante from "./Admin/Registrar-estudiante";
import Anotacion from "./Admin/Registrar-Anotacion";


createRoot(document.getElementById("root")).render(
    <React.StrictMode>
        <AuthProvider>
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<LoginPantalla />} />
                <Route path="/verificacion" element={<Verificacion />} />

                <Route path="/plantel" element={
                    <RutaProtegida roles={["Admin"]}>
                     <PlantelPantalla />
                    </RutaProtegida>
                } />
                <Route path="/estudiante" element={
                    <RutaProtegida roles={["Estudiante"]}>
                        <EstudiantePantalla />
                    </RutaProtegida>
                } />
                <Route path="/docentes" element={
                    <RutaProtegida roles={[ "Docente"]}>
                        <DocentesPantalla />
                    </RutaProtegida>
                } />
                <Route path="/admin" element={
                    <RutaProtegida roles={["Admin"]}>
                        <Admin />
                    </RutaProtegida>
                } />
                <Route path="/registrar/estudiante" element={
                    <RutaProtegida roles={["Admin"]}>
                        <RegistrarEstudiante />
                    </RutaProtegida>
                } />
                <Route path="/registrar/anotacion" element={
                    <RutaProtegida roles={["Admin"]}>
                        <Anotacion />
                    </RutaProtegida>
                } />
            </Routes>
        </BrowserRouter>
        </AuthProvider>  
    </React.StrictMode>
);