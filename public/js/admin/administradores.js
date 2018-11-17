fetch('/api/docente/administradores/')
  .then((response) => {
    return response.json();
  })
  .then((administradores) => {
    let adminTable = $('#docentesTableBody');
    let index = 1;
    for (let admin of administradores) {
      let tr = $(document.createElement('tr'));
      let th = $(document.createElement('th'));
      th.append(index++);
      th.attr('scope', 'row');
      let tdApellidos = $(document.createElement('td'));
      let tdNombres = $(document.createElement('td'));
      let tdDNI = $(document.createElement('td'));
      let tdemail = $(document.createElement('td'));
      let tdEstado = $(document.createElement('td'));
      tdApellidos.append(admin.apellidos);
      tdNombres.append(admin.nombres);
      tdDNI.append(admin.DNI);
      tdemail.append(admin.email);
      tdEstado.append(admin.estadoActivo == '1'?'Activo':'Desactivado');
      tr.append(th, tdApellidos, tdNombres, tdDNI, tdemail, tdEstado);
      adminTable.append(tr);
    }
  })