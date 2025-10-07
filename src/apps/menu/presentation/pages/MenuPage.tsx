import { useAuthContext } from "../../../auth/presentation/context/AuthContext";
import { getProfilePicUrl } from "../../../../shared/utils/profile";
import Bienvenida from "../components/Bienvenida";
import MisionVisionValores from "../components/MisionVisionValores";
import AccesosRapidos from "../components/AccesosRapidos";
import NoticiasComunicados from "../components/NoticiasComunicados";
import CalendarioEventos from "../components/CalendarioEventos";
import EstructuraOrganizacional from "../components/EstructuraOrganizacional";
import DocumentosRecursosRapidos from "../components/DocumentosRecursosRapidos";
import ReconocimientosCumpleanios from "../components/ReconocimientosCumpleanios";
import SoporteContacto from "../components/SoporteContacto";

export default function MenuPage() {
  const { user } = useAuthContext();

  return (
    <div className="space-y-8 w-full h-full">
      <Bienvenida />
      <MisionVisionValores />
      <AccesosRapidos />
      {/* <NoticiasComunicados /> */}
      {/* <CalendarioEventos /> */}
      <EstructuraOrganizacional />
      <DocumentosRecursosRapidos />
      {/* <ReconocimientosCumpleanios /> */}
      <SoporteContacto />
    </div>
  );
}