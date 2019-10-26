import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';

import api from '../../services/api';

import {
  Loading,
  Owner,
  IssueList,
  PageContainer,
  ButtonDefault,
} from './styles';
import Container from '../../components/Container';

class Respository extends Component {
  constructor(props) {
    super(props);
    this.state = {
      repository: {},
      issues: [],
      loading: true,
      filterRepository: 'all',
      filterLoading: false,
      page: 1,
    };
  }

  componentDidMount() {
    const { filterRepository, page } = this.state;

    this.searchRepository(filterRepository, page);
  }

  handleChangeFilter = ({ target: { value } }) => {

    this.setState({ filterLoading: true });

    this.searchRepository(value, 1);
  };

  handleBeforePage = () => {
    const { filterRepository, page } = this.state;

    this.setState({ filterLoading: true });

    this.searchRepository(filterRepository, page - 1);
  };

  handleNextPage = () => {
    const { filterRepository, page } = this.state;

    this.setState({ filterLoading: true });

    this.searchRepository(filterRepository, page + 1);
  };

  searchRep = repoName => {
    return api.get(`/repos/${repoName}`);
  };

  searchIssues = (state, repoName, page) => {
    return api.get(`/repos/${repoName}/issues`, {
      params: {
        state,
        per_page: 5,
        page,
      },
    });
  };

  async searchRepository(state, page) {
    const { match } = this.props;

    const repoName = decodeURIComponent(match.params.repository);

    const [repository, issues] = await Promise.all([
      this.searchRep(repoName),
      this.searchIssues(state, repoName, page),
    ]);

    this.setState({
      repository: repository.data,
      issues: issues.data,
      loading: false,
      filterRepository: state,
      filterLoading: false,
      page,
    });
  }

  render() {
    const {
      repository,
      issues,
      loading,
      filterRepository,
      filterLoading,
      page,
    } = this.state;
    if (loading) {
      return <Loading>carregando</Loading>;
    }

    return (
      <Container>
        <Owner>
          <Link to="/">Voltar aos repositórios</Link>
          <img src={repository.owner.avatar_url} alt={repository.owner.login} />
          <h1>{repository.name}</h1>
          <p>{repository.description}</p>
        </Owner>
        <PageContainer>
          <select value={filterRepository} onChange={this.handleChangeFilter}>
            <option value="all">Todas</option>
            <option value="open">Aberta</option>
            <option value="closed">Fechada</option>
          </select>

          <div>
            <ButtonDefault
              charge={page === 1 || filterLoading}
              onClick={this.handleBeforePage}
              type="button"
            >
              Anterior
            </ButtonDefault>
            <ButtonDefault
              charge={filterLoading}
              onClick={this.handleNextPage}
              type="button"
            >
              Próxima
            </ButtonDefault>
          </div>
        </PageContainer>
        {!filterLoading && (
          <IssueList>
            {issues.map(issue => (
              <li key={String(issue.id)}>
                <img src={issue.user.avatar_url} alt={issue.user.login} />
                <div>
                  <strong>
                    <a href={issue.html_url}>{issue.title}</a>
                    {issue.labels.map(label => (
                      <span key={String(label.id)}>{label.name}</span>
                    ))}
                  </strong>
                  <p>{issue.user.login}</p>
                </div>
              </li>
            ))}
          </IssueList>
        )}
      </Container>
    );
  }
}

Respository.propTypes = {
  match: PropTypes.shape({
    params: PropTypes.shape({
      repository: PropTypes.string,
    }),
  }).isRequired,
};

export default Respository;
