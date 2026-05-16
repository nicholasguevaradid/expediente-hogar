using Microsoft.Data.SqlClient;
using System;
using System.Collections.Generic;
using System.Text;

namespace MedContracts.Control_Interface.RepoDapper
{
    public interface IRepositorioDapper
    {
        SqlConnection ObtenerRepositorio();
    }
}
