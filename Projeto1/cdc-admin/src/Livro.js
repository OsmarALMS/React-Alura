import React, { Component } from 'react';
import $ from 'jquery';
import InputCustomizado from './componentes/InputCustomizado';
import BotaoSubmitCustomizado from './componentes/BotaoSubmitCustomizado';
import PubSub from 'pubsub-js';
import TratadorErros from './TratadorErros';

class FormularioLivro extends Component {

    constructor(){
        super();
        this.state = {titulo:'',preco:'',autorId:''};
        this.enviaForm = this.enviaForm.bind(this);
    }

    enviaForm(evento){
        evento.preventDefault();
        $.ajax({
            url:"http://localhost:8080/api/livros",
            contentType:"application/json",
            dataType:"json",
            type:"post",
            data: JSON.stringify({
                titulo:this.state.titulo,
                preco:this.state.preco,
                autorId:this.state.autorId
            }),
            success: resposta => {
                PubSub.publish('atualiza-lista-livros',resposta);
                this.setState({titulo:'',preco:'',autorId:''});
            },
            error: resposta => {
                if(resposta.status === 400){
                    new TratadorErros().publicaErros(resposta.responseJSON);
                }
            },
            beforeSend: () => {
                PubSub.publish('limpa-erros',{});
            }
        });
    }

    salvaAlteracao(nomeInput, evento){
        var campoSendoAlterado = {};
        campoSendoAlterado[nomeInput] = evento.target.value;
        this.setState(campoSendoAlterado);
    }

    render(){
        return(
            <div className="pure-form pure-form-aligned">
              <form className="pure-form pure-form-aligned" onSubmit={this.enviaForm} method="post">
                <InputCustomizado label="Titulo" id="titulo" name="titulo" type="text" value={this.state.titulo} onChange={this.salvaAlteracao.bind(this,'titulo')} />
                <InputCustomizado label="Preço" id="preco" name="preco" type="number" value={this.state.preco} onChange={this.salvaAlteracao.bind(this,'preco')} />
                
                <div className="pure-control-group">
                    <label htmlFor="autorId"></label> 
                    <select value={this.state.autorId} id="autorId" name="autorId" onChange={this.salvaAlteracao.bind(this,'autorId')}>
                        <option value="">Selecione o Autor</option>
                        {
                            this.props.autores.map(autor => {
                                return <option key={autor.id} value={autor.id}>{autor.nome}</option>
                            })
                        }
                    </select>
                </div>
                
                <BotaoSubmitCustomizado label="Salvar"/>
              </form>             
            </div>
        );
    }
}

class TabelaLivros extends Component {

    render(){
        return(
            <div>            
              <table className="pure-table">
                <thead>
                  <tr>
                    <th>Titulo</th>
                    <th>Preço</th>
                    <th>Autor</th>
                  </tr>
                </thead>
                <tbody>
                  {
                    this.props.lista.map(livro => {
                      return (
                        <tr key={livro.id}>
                          <td>{livro.titulo}</td>
                          <td>{livro.preco}</td>
                          <td>{livro.autor.nome}</td>
                        </tr>
                      );
                    })
                  }
                </tbody>
              </table> 
            </div>  
        );
    }
}

export default class LivroBox extends Component {

    constructor(){
        super();
        this.state = {lista : [], autores : []};
    }

    componentDidMount(){
        $.ajax({
            url:"http://localhost:8080/api/livros",
            dataType: 'json',
            success: resposta => {
                this.setState({lista:resposta});
            }
        });

        $.ajax({
            url:"http://localhost:8080/api/autores",
            dataType: 'json',
            success: resposta => {
                this.setState({autores:resposta});
            }
        });

        PubSub.subscribe('atualiza-lista-livros', (topico, novaLista) => {
            this.setState({lista:novaLista});
        });
    }

    render(){
        return(
            <div>
                <div className="header">
                    <h1>Cadastro de Livros</h1>
                </div>
                <div className="content" id="content">
                    <FormularioLivro autores={this.state.autores}/>
                    <TabelaLivros lista={this.state.lista}/>
                </div>
            </div> 
        );
    }
}