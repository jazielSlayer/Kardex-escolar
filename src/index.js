import React from "react";
import { createRoot} from "react-dom/client";
import { Routes, Route, BrowserRouter } from "react-router-dom";

import LoginPantalla from "./Login";
import PlantelPantalla from "./Plantel_Pantalla";
import EstudiantePantalla from "./Estudiante_Pantalla";
import DocentesPantalla from "./Docentes_Pantalla";
import Admin from "./Admin/Admin"

createRoot(document.getElementById("root")).render(
    <React.StrictMode>
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<LoginPantalla />} />
                <Route path="/plantel" element={<PlantelPantalla />} />
                <Route path="/estudiante" element={<EstudiantePantalla />} />
                <Route path="/docentes" element={<DocentesPantalla />} />
                <Route path="/admin" element={<Admin />}/>
                
            </Routes>
        </BrowserRouter>  
    </React.StrictMode>
);