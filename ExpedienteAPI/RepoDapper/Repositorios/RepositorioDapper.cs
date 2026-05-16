using MedContracts.Control_Interface.RepoDapper;
using Microsoft.Data.SqlClient;
using Microsoft.Extensions.Configuration;
using System;
using System.Collections.Generic;
using System.Text;

namespace RepoDapper.Repositorios
{
    public class RepositorioDapper : IRepositorioDapper
    {
        private readonly IConfiguration _configuracion;
        private readonly SqlConnection _conexionBaseDatos;

        public RepositorioDapper(IConfiguration configuracion)
        {
            _configuracion = configuracion;
            _conexionBaseDatos = new SqlConnection(_configuracion.GetConnectionString("BD"));
        }

        public SqlConnection ObtenerRepositorio()
        {
            return _conexionBaseDatos;
        }
    }
}
