### Paso a paso para la implementacion en una nueva institucion


## Instalacion Backend 

1. Se debe clonar el repositorio y se sigue con las indicaciones del readme

## Instalacion de Frontend

1. se debe clonar el repositorio y se sigue con las indicaciones del readme

## Personalizacion de aplicacion 

Las principales personalizaciones se  deben realizar en los siguientes archivos :
1. se debe cambiar el logo de la carpeta public logo.png por el logo de la empresa 
2. se debe cambiar el slogan por el de la empresa apps/menu/presentation/components/Bienbenida.tsx linea 26
3. se debe cambiar datos de contacto por el de la empresa apps/menu/presentation/components/SoporteContacto.tsx const soporte linea 4 y linea 38  opcional cambiar el correo de contacto de la pagina de loginPage.tsx linea 213
4. se debe cambiar la mision, vision y valores por los de la empresa apps/menu/presentation/components/MisionVisionValores.tsx const MISION, VISION, VAlores lineas 15, 16, 17 - 54
5. se debe cambiar los accesos rapidos por los de la empresa apps/menu/presentation/components/AccesosRapidos.tsx linea 4- 36
6. se debe cambiar los datos de la estructura organizacional por los de la empresa por los de la empresa apps/menu/presentation/components/EstructuraOrganizacional.tsx const organigramaData linea 5 y se debe cargar las imagenes de los organigramas en public/institucion/ con sus respectivas rutas 
7. se debe cambiar los datos de documentos y recursos rspidos por los de la empresa apps/menu/presentation/components/DocumentosRecursosRapidos.tsx Documentos linea 5 
8. se debe ajustar el .htacces para que funcione correctamente en el servidor de produccion con el dominio correspondiente 
9. revisar que el .env este configurado correctamente apuntando a la ip del backend y el dominio del frontend respectivamente 




