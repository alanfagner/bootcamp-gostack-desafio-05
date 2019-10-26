import React, { Component } from 'react';
import { FaGithubAlt, FaPlus, FaSpinner } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import api from '../../services/api';

import { Form, SubmitButton, List } from './styles';
import Container from '../../components/Container';

export default class Main extends Component {
  constructor() {
    super();
    this.state = {
      newRep: 'rocketseat/unform',
      repositories: [],
      loading: false,
      error: false,
    };
  }

  componentDidMount() {
    const repositories = localStorage.getItem('repositories');

    if (repositories) {
      this.setState({ repositories: JSON.parse(repositories) });
    }
  }

  componentDidUpdate(_, preventState) {
    const { repositories } = this.state;
    if (preventState.repositories !== repositories) {
      localStorage.setItem('repositories', JSON.stringify(repositories));
    }
  }

  handleInputchange = e => {
    this.setState({ newRep: e.target.value, error: false });
  };

  handleSubmit = async e => {
    e.preventDefault();

    this.setState({ loading: true });

    const { newRep, repositories } = this.state;

    try {
      repositories.forEach(repository => {
        if (repository.name.toUpperCase() === newRep.toUpperCase()) {
          throw new Error('Repositório duplicado');
        }
      });

      const response = await api.get(`/repos/${newRep}`);

      const data = {
        name: response.data.full_name,
      };

      this.setState({
        repositories: [...repositories, data],
        newRep: '',
        loading: false,
      });
    } catch (err) {
      console.log(err);
      this.setState({ error: true, loading: false });
    }
  };

  render() {
    const { loading, newRep, repositories, error } = this.state;

    return (
      <Container>
        <h1>
          <FaGithubAlt />
          Respositórios
        </h1>

        <Form onSubmit={this.handleSubmit} error={error}>
          <input
            onChange={this.handleInputchange}
            value={newRep}
            type="text"
            placeholder="Adicionar repositório"
          />
          <SubmitButton type="submit" charge={loading}>
            {loading ? (
              <FaSpinner color="#fff" size={14} />
            ) : (
              <FaPlus color="#fff" size={14} />
            )}
          </SubmitButton>
        </Form>

        <List>
          {repositories.map(repository => (
            <li key={repository.name}>
              <span>{repository.name}</span>
              <Link
                to={`/repository/${encodeURIComponent(repository.name)}`}
                alt="teste"
              >
                Detalhes
              </Link>
            </li>
          ))}
        </List>
      </Container>
    );
  }
}
